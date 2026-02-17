import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrgSettingsForm } from "@/components/admin/org-settings-form";

export default async function OrgSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: member } = await supabase
        .from("org_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .in("role", ["owner", "admin", "org_admin", "super_admin"])
        .eq("is_active", true)
        .single();

    if (!member) {
        return <div>Access Denied</div>;
    }

    const { data: org, error } = await supabase
        .from("orgs")
        .select("*")
        .eq("id", member.org_id)
        .single();

    if (error) {
        return <div>Error loading organization data.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Organization Settings</h1>
            <div className="bg-fordrax-panel border border-white/5 rounded-xl p-8">
                <OrgSettingsForm org={org} />
            </div>
        </div>
    );
}
