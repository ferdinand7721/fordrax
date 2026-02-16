"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Target, AlertTriangle, FileText, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Campaigns", href: "/campaigns", icon: Target },
    { name: "Phishing Sim", href: "/phishing", icon: AlertTriangle },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Organization", href: "/org", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-fordrax-panel border-r border-white/5 flex flex-col z-50">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Shield className="w-6 h-6 text-fordrax-blue mr-2" />
                <span className="font-bold tracking-wider text-lg">FORDRAX</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "text-white bg-white/5 shadow-[0_0_15px_rgba(0,87,255,0.1)]"
                                    : "text-fordrax-titanium hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-fordrax-blue" />
                            )}
                            <item.icon className={cn("w-5 h-5", isActive ? "text-fordrax-blue" : "group-hover:text-white")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="bg-fordrax-black/50 p-4 rounded-lg border border-white/5">
                    <p className="text-xs text-fordrax-titanium uppercase mb-2">System Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono text-emerald-400">OPERATIONAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
