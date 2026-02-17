import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BookOpen, Clock, Globe, Lock, Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function LibraryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch modules allowed by RLS
    const { data: modules } = await supabase
        .from("modules")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true });

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />

                <main className="flex-1 mt-16 p-8 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Content Library</h1>
                            <p className="text-fordrax-titanium">Browse training modules and awareness content.</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-fordrax-titanium" />
                            <input
                                type="text"
                                placeholder="Search modules..."
                                className="pl-10 pr-4 py-2 bg-fordrax-panel border border-white/10 rounded-lg text-sm w-64 focus:ring-2 focus:ring-fordrax-blue outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules?.map((module) => (
                            <div key={module.id} className="bg-fordrax-panel/60 border border-white/5 rounded-xl overflow-hidden hover:border-fordrax-blue/50 transition-all duration-300 group hover:-translate-y-1">
                                <div className="h-2 bg-gradient-to-r from-fordrax-blue to-fordrax-cyan" />
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-mono text-fordrax-titanium border border-white/10 px-2 py-1 rounded inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {module.estimated_minutes} min
                                        </span>
                                        {module.visibility === 'global_template' ? (
                                            <span title="Global Template">
                                                <Globe className="w-4 h-4 text-fordrax-cyan" />
                                            </span>
                                        ) : (
                                            <span title="Org Only">
                                                <Lock className="w-4 h-4 text-fordrax-titanium" />
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-fordrax-blue transition-colors line-clamp-2">{module.title}</h3>
                                        <p className="text-sm text-fordrax-titanium mt-2 line-clamp-3">{module.description}</p>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                        {module.tags?.map((tag: string) => (
                                            <span key={tag} className="text-xs bg-white/5 px-2 py-1 rounded text-fordrax-titanium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!modules || modules.length === 0) && (
                            <div className="col-span-full py-12 text-center text-fordrax-titanium">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No modules found in the library.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
