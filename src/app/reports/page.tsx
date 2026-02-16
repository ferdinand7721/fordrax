import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MetricsChart } from "@/components/analytics/metrics-chart";
import { Download, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Dummy Data for visualization purposes (Real aggregation is heavy for MVP)
const phishingData = [
    { month: "Jan", clicks: 45 },
    { month: "Feb", clicks: 32 },
    { month: "Mar", clicks: 28 },
    { month: "Apr", clicks: 15 },
    { month: "May", clicks: 12 },
    { month: "Jun", clicks: 5 },
];

const complianceData = [
    { week: "W1", completion: 20 },
    { week: "W2", completion: 45 },
    { week: "W3", completion: 60 },
    { week: "W4", completion: 85 },
];

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />

                <main className="flex-1 mt-16 p-8 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Security Intelligence</h1>
                            <p className="text-fordrax-titanium">Behavioral analytics and risk progression.</p>
                        </div>

                        <button className="flex items-center gap-2 bg-fordrax-panel border border-white/10 hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" /> Export Executive PDF
                        </button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <MetricsChart
                            title="Phishing Susceptibility Trend"
                            data={phishingData}
                            category="month"
                            dataKey="clicks"
                            type="line"
                            color="#FF3333" // Fordrax Danger
                        />

                        <MetricsChart
                            title="Training Compliance Rate (%)"
                            data={complianceData}
                            category="week"
                            dataKey="completion"
                            type="bar"
                            color="#00E5FF" // Fordrax Cyan
                        />
                    </div>

                    <div className="mt-8 bg-fordrax-panel/60 border border-white/5 rounded-xl p-8 flex items-center justify-center text-center">
                        <div className="max-w-md">
                            <FileText className="w-12 h-12 text-fordrax-titanium mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-bold">Detailed Logs</h3>
                            <p className="text-fordrax-titanium mt-2 mb-6">Access granular event logs for audit and compliance purposes.</p>
                            <button className="text-fordrax-blue hover:text-white underline text-sm">View Audit Trail</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
