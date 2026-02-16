"use client";

import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar() {
    const { user, loading } = useUser();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Force refresh
        router.refresh();
    };

    return (
        <div className="h-16 bg-fordrax-black/80 backdrop-blur-md border-b border-white/5 fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-8">
            {/* Breadcrumbs or Title could go here */}
            <div className="text-sm text-fordrax-titanium hidden md:block">
                Console &gt; Dashboard
            </div>

            <div className="flex items-center gap-6">
                <button className="text-fordrax-titanium hover:text-white transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-fordrax-danger rounded-full border border-fordrax-black" />
                </button>

                <div className="h-8 w-[1px] bg-white/10" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-white">
                            {loading ? "Loading..." : (user?.full_name || user?.email)}
                        </div>
                        <div className="text-xs text-fordrax-cyan">
                            Administrator
                        </div>
                    </div>

                    <button className="w-10 h-10 rounded-full bg-fordrax-panel border border-white/10 flex items-center justify-center overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="User" />
                        ) : (
                            <User className="w-5 h-5 text-fordrax-titanium" />
                        )}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="ml-2 text-fordrax-titanium hover:text-fordrax-danger transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
