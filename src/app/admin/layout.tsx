import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Role Check
    // We check if the user has an admin role in ANY active org or is super_admin
    // For simplicity, we just check the current org context if possible, but here we check DB.

    // Check if user has 'admin' or 'owner' or 'super_admin'
    // This is a loose check for the layout; specific pages will have stricter RLS/checks.
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const { data: orgMember } = await supabase
        .from("org_members")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["owner", "admin", "org_admin", "super_admin"])
        .eq("is_active", true)
        .maybeSingle();

    const isSuperAdmin = profile?.role === 'super_admin';
    const isOrgAdmin = !!orgMember;

    if (!isSuperAdmin && !isOrgAdmin) {
        redirect("/library"); // Kick non-admins back to library
    }

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white selection:bg-fordrax-cyan/30">
            <AdminSidebar isSuperAdmin={isSuperAdmin} />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar title="Admin Console" />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
