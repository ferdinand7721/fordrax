import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ShieldCheck, Lock, Activity, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch real data
  const { count: pendingAssignments } = await supabase
    .from("campaign_assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  const { count: phishingClicks } = await supabase
    .from("phishing_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_type", "clicked");

  // Mock Risk Score Calculation (Inverse of security posture)
  // Base 100 - (Clicks * 20) - (Pending * 5)
  // This is a simplified "personal risk score"
  let riskScore = 0;
  let riskLevel = "Low";
  let riskColor: "blue" | "cyan" | "danger" | "emerald" = "emerald";

  if (phishingClicks || pendingAssignments) {
    const clickPenalty = (phishingClicks || 0) * 20;
    const pendingPenalty = (pendingAssignments || 0) * 5;
    riskScore = Math.min(100, clickPenalty + pendingPenalty);

    if (riskScore > 50) {
      riskLevel = "Critical";
      riskColor = "danger";
    } else if (riskScore > 20) {
      riskLevel = "Medium";
      riskColor = "cyan"; // Warning color in this palette
    } else {
      riskLevel = "Low";
      riskColor = "blue";
    }
  }

  return (
    <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="flex-1 mt-16 p-8 relative overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Hero Section */}
          <div className="relative z-10 max-w-6xl mx-auto space-y-8">
            <div className="space-y-2 animate-float">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-fordrax-titanium bg-clip-text text-transparent">
                FORDRAX <span className="text-fordrax-blue">CIBERCONCIENCIA</span>
              </h1>
              <p className="text-lg text-fordrax-titanium max-w-2xl">
                Global Security Awareness Platform.
                <span className="block text-fordrax-cyan mt-1 font-mono text-xs tracking-wider">
                  STATUS: ONLINE // THREAT LEVEL: MONITORING
                </span>
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <KpiCard
                title="Personal Risk Score"
                value={riskLevel}
                label={`(${riskScore}/100)`}
                icon={AlertTriangle}
                color={riskColor}
                trend="neutral"
                trendValue="Stable"
              />
              <KpiCard
                title="Pending Training"
                value={pendingAssignments || 0}
                label="Modules"
                icon={Lock}
                color={pendingAssignments ? "cyan" : "emerald"}
                trend={pendingAssignments ? "down" : "neutral"}
                trendValue={pendingAssignments ? "+2" : "0"}
              />
              <KpiCard
                title="Phishing Incidents"
                value={phishingClicks || 0}
                label="Clicks Detected"
                icon={ShieldCheck}
                color={phishingClicks ? "danger" : "emerald"}
                trend={phishingClicks ? "down" : "neutral"}
                trendValue="0"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
