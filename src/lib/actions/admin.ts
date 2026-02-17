"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrgSettings(orgId: string, data: any) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Permission Check
    // Ensuring user is admin of target org
    const { data: member } = await supabase
        .from("org_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("org_id", orgId)
        .in("role", ["owner", "admin", "org_admin", "super_admin"])
        .single();

    if (!member) {
        return { success: false, error: "Permission denied." };
    }

    // Update
    const { error } = await supabase
        .from("orgs")
        .update({
            display_name: data.display_name,
            legal_type: data.legal_type,
            rfc: data.rfc,
            company_name: data.company_name,
            difficulty_level: data.difficulty_level
        })
        .eq("id", orgId);

    if (error) {
        console.error("Update Org Error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/org-settings");
    return { success: true };
}
