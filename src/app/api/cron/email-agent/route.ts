import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration
const CRON_SECRET = process.env.CRON_SECRET || 'titan-master-secret';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
    // 1. Auth Check
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');

    if (authHeader !== `Bearer ${CRON_SECRET}` && queryKey !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!SERVICE_KEY) {
        return NextResponse.json({ error: 'Service Key missing' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    // 2. Fetch Queued Jobs
    const { data: jobs, error } = await supabase
        .from('email_jobs')
        .select('*')
        .eq('status', 'queued')
        .limit(10); // Batch size

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
        return NextResponse.json({ message: 'No jobs to process' });
    }

    const results = [];

    // 3. Process Jobs
    for (const job of jobs) {
        try {
            console.log(`[EmailAgent] Processing Job ${job.id} (${job.job_type}) for ${job.payload.email}`);

            // --- SIMULATE EMAIL SENDING ---
            // In a real app, you'd call Resend/SendGrid here.
            await new Promise(r => setTimeout(r, 500)); // Simulate network latency

            console.log(`[EmailAgent] SENT: "Here is your certificate for ${job.payload.module_title}" to ${job.payload.email}`);
            // ------------------------------

            // 4. Update Status
            const { error: updateError } = await supabase
                .from('email_jobs')
                .update({
                    status: 'sent',
                    processed_at: new Date().toISOString()
                })
                .eq('id', job.id);

            if (updateError) throw updateError;
            results.push({ id: job.id, status: 'success' });

        } catch (err: any) {
            console.error(`[EmailAgent] Failed Job ${job.id}:`, err);
            await supabase
                .from('email_jobs')
                .update({
                    status: 'failed',
                    last_error: err.message,
                    attempts: job.attempts + 1
                })
                .eq('id', job.id);
            results.push({ id: job.id, status: 'failed', error: err.message });
        }
    }

    return NextResponse.json({ processed: results.length, jobs: results });
}
