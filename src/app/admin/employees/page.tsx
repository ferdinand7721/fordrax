import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, MoreHorizontal, Shield, User } from "lucide-react";

export default async function EmployeesPage() {
    const supabase = await createClient();

    // Get Current User's Org
    // In a real app with multi-org switching, we'd read a cookie or context.
    // Here we assume single org or first org active.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

    if (!member) return <div>No active organization found.</div>;

    // Fetch Employees
    const { data: employees, error } = await supabase
        .from("org_members")
        .select(`
            id,
            role,
            is_active,
            joined_at,
            profiles:user_id (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("org_id", member.org_id)
        .order("joined_at", { ascending: false });

    if (error) {
        console.error("Error fetching employees:", error);
        return <div>Error processing request.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Employees</h1>
                    <p className="text-fordrax-titanium">Manage access and roles for your organization.</p>
                </div>
                <button className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Invite Employee
                </button>
            </div>

            <div className="bg-fordrax-panel border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-fordrax-titanium uppercase text-xs font-mono">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {employees?.map((emp: any) => (
                            <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <Avatar className="w-8 h-8 rounded border border-white/10">
                                        <AvatarImage src={emp.profiles?.avatar_url || ""} />
                                        <AvatarFallback className="bg-fordrax-black text-xs text-white">
                                            {(emp.profiles?.full_name || "U")[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-white">{emp.profiles?.full_name || "Unknown"}</div>
                                        <div className="text-xs text-fordrax-titanium">{emp.profiles?.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${['owner', 'admin', 'org_admin'].includes(emp.role)
                                            ? "bg-fordrax-danger/10 text-fordrax-danger border-fordrax-danger/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        }`}>
                                        {['owner', 'admin', 'org_admin'].includes(emp.role) ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                        {emp.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block w-2 H-2 rounded-full mr-2 ${emp.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                    {emp.is_active ? "Active" : "Inactive"}
                                </td>
                                <td className="px-6 py-4 text-fordrax-titanium">
                                    {new Date(emp.joined_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-white p-2">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {employees?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                    No employees found. Invite someone to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
