import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Users, Settings, Building } from "lucide-react";
import { redirect } from "next/navigation";

export default async function OrgPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Current User's Org (Assuming single tenant for MVP)
    // In real app, we would use a context or session claim
    const { data: member } = await supabase
        .from("org_members")
        .select("org_id, orgs(name, slug)")
        .eq("user_id", user.id)
        .single();

    const orgData = member?.orgs;
    const org = Array.isArray(orgData) ? orgData[0] : orgData;

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />

                <main className="flex-1 mt-16 p-8 relative overflow-hidden">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Organization Settings</h1>
                        <p className="text-fordrax-titanium">Manage your tenant configuration and team members.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* General Info */}
                        <div className="bg-fordrax-panel border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Building className="w-5 h-5 text-fordrax-blue" />
                                <h2 className="text-lg font-bold">General Information</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-fordrax-titanium font-medium mb-1">Organization Name</label>
                                    <input
                                        type="text"
                                        value={org?.name || "Loading..."}
                                        disabled
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white/50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-fordrax-titanium font-medium mb-1">Tenant Slug</label>
                                    <input
                                        type="text"
                                        value={org?.slug || "Loading..."}
                                        disabled
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white/50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Members Placeholder */}
                        <div className="bg-fordrax-panel border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-5 h-5 text-fordrax-cyan" />
                                <h2 className="text-lg font-bold">Team Members</h2>
                            </div>

                            <div className="text-center py-8 text-fordrax-titanium text-sm">
                                <p>Member management is limited to Admins.</p>
                                <button className="mt-4 text-fordrax-blue hover:underline">View all members</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
