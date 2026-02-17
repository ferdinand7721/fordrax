import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizRunner } from "@/components/evaluation/quiz-runner";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function EvaluationPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Fetch Module
    const { data: module, error: mError } = await supabase
        .from("modules")
        .select("id, title, slug")
        .eq("slug", slug)
        .single();

    if (mError || !module) {
        redirect("/library");
    }

    // 2. Fetch Questions & Choices (Randomized ideally, but sequential for now)
    const { data: questionsData, error: qError } = await supabase
        .from("questions")
        .select(`
            id,
            prompt,
            difficulty,
            question_choices (
                id,
                label,
                order_index
            )
        `)
        .eq("module_id", module.id); // Filtering by difficulty? Not yet, taking all.

    if (qError || !questionsData) {
        console.error("Error fetching questions:", qError);
        return <div>Error loading exam.</div>; // Should use Error Boundary
    }

    // 3. Transform Data (Ensure no is_correct leakage)
    const questions = questionsData.map((q: any) => ({
        id: q.id,
        prompt: q.prompt,
        difficulty: q.difficulty,
        choices: q.question_choices.sort((a: any, b: any) => a.order_index - b.order_index)
    }));

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />
                <main className="flex-1 p-8 md:p-12 flex flex-col">
                    <QuizRunner
                        moduleId={module.id}
                        moduleSlug={module.slug}
                        moduleTitle={module.title}
                        questions={questions}
                    />
                </main>
            </div>
        </div>
    );
}
