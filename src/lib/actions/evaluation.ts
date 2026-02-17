"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

interface SubmitEvaluationParams {
    moduleId: string;
    answers: Record<string, string>; // question_id -> choice_id
}

interface SubmitEvaluationResult {
    success: boolean;
    score?: number;
    passed?: boolean;
    evaluationId?: string;
    certificateId?: string;
    error?: string;
}

export async function submitEvaluation({ maxScore = 100, moduleId, answers }: SubmitEvaluationParams & { maxScore?: number }): Promise<SubmitEvaluationResult> {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Get active Org (using the first one for now as per current logic)
    const { data: member } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();

    const orgId = member?.org_id;

    if (!orgId) {
        return { success: false, error: "User does not belong to an active organization." };
    }

    // 2. Fetch Correct Answers
    const { data: questions, error: qError } = await supabase
        .from("questions")
        .select(`
            id,
            question_choices (
                id,
                is_correct
            )
        `)
        .eq("module_id", moduleId);

    if (qError || !questions) {
        console.error("Error fetching questions:", qError);
        return { success: false, error: "Failed to load exam key." };
    }

    // Fetch Module Details (for email agent)
    const { data: moduleData } = await supabase
        .from("modules")
        .select("title")
        .eq("id", moduleId)
        .single();


    // 3. Calculate Score
    let correctCount = 0;
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
        return { success: false, error: "No questions found for this module." };
    }

    questions.forEach(q => {
        const userChoiceId = answers[q.id];
        const correctChoice = q.question_choices.find((c: any) => c.is_correct);

        if (correctChoice && userChoiceId === correctChoice.id) {
            correctCount++;
        }
    });

    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= 80;

    // 4. Record Evaluation
    const { data: evalRecord, error: insertError } = await supabase
        .from("evaluations")
        .insert({
            user_id: user.id,
            module_id: moduleId,
            org_id: orgId,
            score: score,
            passed: passed,
            difficulty: 'basic', // Defaulting for now
            status: passed ? 'passed' : 'failed',
            completed_at: new Date().toISOString()
        })
        .select()
        .single();

    if (insertError) {
        console.error("Error saving evaluation:", insertError);
        return { success: false, error: "Failed to save results." };
    }

    let certificateId: string | undefined;

    // 5. Issue Certificate if Passed
    if (passed) {
        // Prepare Certificate Data
        const issuedAt = new Date();
        const certUuid = crypto.randomUUID();

        // Format: 'FORDRAX|org=|user=|module=|issued_at=|cert_uuid='
        // Date format must match SQL to_char: YYYY-MM-DD"T"HH24:MI:SS"Z"
        // ISOString is '2023-01-01T12:00:00.000Z', we need to strip milliseconds if strictly matching SQL or just use ISO for simplicity if we control verification.
        // Let's match the SQL function's intent:
        const dateStr = issuedAt.toISOString().split('.')[0] + "Z"; // Close enough approximation

        const chainText = `FORDRAX|org=${orgId}|user=${user.id}|module=${moduleId}|issued_at=${dateStr}|cert_uuid=${certUuid}`;
        const hash = crypto.createHash('sha256').update(chainText).digest('hex');

        const { data: certRecord, error: certError } = await supabase
            .from("certificates")
            .insert({
                org_id: orgId,
                user_id: user.id,
                module_id: moduleId,
                evaluation_id: evalRecord.id,
                certificate_uuid: certUuid,
                issued_at: issuedAt.toISOString(),
                chain_text: chainText,
                hash_sha256: hash
            })
            .select()
            .single();

        if (certError) {
            console.error("Error issuing certificate:", certError);
            // We don't fail the evaluation, but we flag the error? 
            // ideally specific strict transactional logic, but here we just log.
        } else {
            certificateId = certRecord.id;

            // 7. Queue Email Job (Agent Handoff)
            // We use the Service Role to bypass the "block client inserts" RLS on email_jobs
            // This ensures only the Server Action defines what jobs are created
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (serviceRoleKey) {
                // Dynamic import to avoid client-side bundling issues if this file was shared (it's "use server" so it's fine)
                const { createClient: createServiceClient } = require('@supabase/supabase-js');
                const adminClient = createServiceClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    serviceRoleKey,
                    {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false,
                            detectSessionInUrl: false,
                        },
                    }
                );

                const { error: jobError } = await adminClient
                    .from("email_jobs")
                    .insert({
                        org_id: orgId,
                        user_id: user.id,
                        job_type: 'send_certificate',
                        status: 'queued',
                        payload: {
                            email: user.email, // Assuming we have it in the session or profile
                            name: user.user_metadata?.full_name || "User",
                            certificate_id: certificateId,
                            module_title: moduleData?.title || "Module"
                        }
                    });

                if (jobError) console.error("Error queuing email job:", jobError);
            } else {
                console.warn("SUPABASE_SERVICE_ROLE_KEY not set. Email job skipped.");
            }
        }
    }

    // 6. Revalidate
    revalidatePath("/library");
    revalidatePath(`/evaluation/${moduleId}`);

    return {
        success: true,
        score,
        passed,
        evaluationId: evalRecord.id,
        certificateId
    };
}
