import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, Globe } from "lucide-react";

export default async function CompaniesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Super Admin Check
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'super_admin') {
        return <div className="p-8 text-center text-red-500">Restricted Access: Super Admin Only.</div>;
    }

    const { data: orgs, error } = await supabase
        .from("orgs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return <div>Error loading companies.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-fordrax-cyan" />
                        Companies Registry
                    </h1>
                    <p className="text-fordrax-titanium">Global multi-tenant management.</p>
                </div>
                <button className="px-4 py-2 bg-fordrax-cyan text-black font-bold rounded-lg hover:bg-white transition-colors">
                    + New Tenant
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs?.map((org: any) => (
                    <div key={org.id} className="bg-fordrax-panel border border-white/5 rounded-xl p-6 hover:border-fordrax-cyan/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-white group-hover:bg-fordrax-cyan group-hover:text-black transition-colors">
                                <Globe className="w-5 h-5" />
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${org.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {org.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{org.display_name}</h3>
                        <p className="text-xs text-fordrax-titanium mb-4 font-mono">{org.slug}</p>

                        <div className="space-y-2 border-t border-white/5 pt-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Legal:</span>
                                <span className="text-gray-300">{org.legal_type || "N/A"}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">RFC:</span>
                                <span className="text-gray-300 font-mono">{org.rfc || "-"}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Created:</span>
                                <span className="text-gray-300">{new Date(org.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
