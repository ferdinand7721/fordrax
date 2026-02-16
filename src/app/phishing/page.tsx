import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Plus, Mail, AlertTriangle, Eye, MousePointer, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PhishingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch simulations
    const { data: simulations } = await supabase
        .from("phishing_simulations")
        .select("*, phishing_events(event_type)")
        .order("sent_at", { ascending: false });

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />

                <main className="flex-1 mt-16 p-8 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Phishing Simulator</h1>
                            <p className="text-fordrax-titanium">Test your organization's resilience against social engineering.</p>
                        </div>

                        <button className="flex items-center gap-2 bg-fordrax-danger hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4" /> New Simulation
                        </button>
                    </div>

                    {/* List */}
                    <div className="bg-fordrax-panel border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-xs uppercase text-fordrax-titanium">
                                    <th className="p-4 font-medium">Simulation Title</th>
                                    <th className="p-4 font-medium text-center">Sent</th>
                                    <th className="p-4 font-medium text-center">Opened</th>
                                    <th className="p-4 font-medium text-center">Clicked</th>
                                    <th className="p-4 font-medium text-center">Reported</th>
                                    <th className="p-4 font-medium text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {simulations?.map((sim) => {
                                    const events = sim.phishing_events || [];
                                    const sent = sim.target_count || 0;
                                    const opened = events.filter((e: any) => e.event_type === 'opened').length;
                                    const clicked = events.filter((e: any) => e.event_type === 'clicked').length;
                                    const reported = events.filter((e: any) => e.event_type === 'reported').length;

                                    return (
                                        <tr key={sim.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-medium text-white group-hover:text-fordrax-danger transition-colors">
                                                    {sim.title}
                                                </div>
                                                <div className="text-sm text-fordrax-titanium flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {sim.sender_email}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-sm">{sent}</td>
                                            <td className="p-4 text-center text-sm text-blue-400">{opened}</td>
                                            <td className="p-4 text-center text-sm text-orange-400 font-bold">{clicked}</td>
                                            <td className="p-4 text-center text-sm text-emerald-400">{reported}</td>
                                            <td className="p-4 text-right text-sm text-fordrax-titanium">
                                                {new Date(sim.sent_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {(!simulations || simulations.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-fordrax-titanium">
                                            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>No active simulations.</p>
                                            <button className="mt-4 text-fordrax-cyan hover:underline text-sm">
                                                Launch a test attack
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
