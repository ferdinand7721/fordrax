import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudioViewer } from "@/components/studio/studio-viewer";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function StudioPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Module & Lessons
    const { data: module, error } = await supabase
        .from("modules")
        .select(`
            *,
            lessons (
                id,
                title,
                section_key,
                order_index,
                content_markdown
            )
        `)
        .eq("slug", slug)
        .single();

    if (error || !module) {
        console.error("Module not found:", slug, error);
        redirect("/library");
    }

    // Sort lessons by order_index
    const sortedLessons = module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || [];

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />
                <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]">
                    <StudioViewer module={module} lessons={sortedLessons} />
                </main>
            </div>
        </div>
    );
}
