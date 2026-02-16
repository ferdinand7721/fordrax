import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Plus, Search, Calendar, Users, BarChart } from "lucide-react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function CampaignsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch campaigns
    const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />

                <main className="flex-1 mt-16 p-8 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Campaigns</h1>
                            <p className="text-fordrax-titanium">Manage awareness drives and training assignments.</p>
                        </div>

                        <button className="flex items-center gap-2 bg-fordrax-blue hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4" /> New Campaign
                        </button>
                    </div>

                    {/* List */}
                    <div className="bg-fordrax-panel border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-xs uppercase text-fordrax-titanium">
                                    <th className="p-4 font-medium">Campaign Title</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Timeline</th>
                                    <th className="p-4 font-medium">Progress</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {campaigns?.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-medium text-white group-hover:text-fordrax-blue transition-colors">
                                                {campaign.title}
                                            </div>
                                            <div className="text-sm text-fordrax-titanium line-clamp-1">
                                                {campaign.description || "No description provided."}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-medium border",
                                                campaign.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                    campaign.status === 'completed' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                                        campaign.status === 'draft' ? "bg-white/5 border-white/10 text-fordrax-titanium" :
                                                            "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                            )}>
                                                {campaign.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-fordrax-titanium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : "TBD"}
                                                {" -> "}
                                                {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "TBD"}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-fordrax-cyan w-[0%]" />
                                                    {/* TODO: Calculate real progress */}
                                                </div>
                                                <span className="text-xs text-fordrax-titanium">0%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-sm hover:text-white text-fordrax-titanium transition-colors">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {(!campaigns || campaigns.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-fordrax-titanium">
                                            <BarChart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>No campaigns found.</p>
                                            <button className="mt-4 text-fordrax-cyan hover:underline text-sm">
                                                Create your first campaign
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
