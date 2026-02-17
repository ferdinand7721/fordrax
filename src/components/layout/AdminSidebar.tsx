"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Users,
    Settings,
    Building2,
    LayoutDashboard,
    LogOut,
    ShieldAlert,
    BookOpen
} from "lucide-react";

interface AdminSidebarProps {
    isSuperAdmin: boolean;
}

export function AdminSidebar({ isSuperAdmin }: AdminSidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/employees", label: "Employees", icon: Users },
        { href: "/admin/org-settings", label: "Organization", icon: Settings },
    ];

    if (isSuperAdmin) {
        links.push({ href: "/admin/companies", label: "Companies (Super)", icon: Building2 });
    }

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-fordrax-panel border-r border-white/5 flex flex-col z-50">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-fordrax-danger to-red-900 flex items-center justify-center text-white font-bold">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight text-white block leading-none">FORDRAX</span>
                        <span className="text-[10px] uppercase tracking-widest text-fordrax-danger font-bold">Admin Console</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                                isActive
                                    ? "bg-fordrax-danger/10 text-white border-l-2 border-fordrax-danger"
                                    : "text-fordrax-titanium hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-fordrax-danger" : "text-gray-500 group-hover:text-white")} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <Link
                    href="/library"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-fordrax-cyan hover:bg-fordrax-cyan/10 transition-colors"
                >
                    <BookOpen className="w-4 h-4" />
                    Back to Learning
                </Link>
            </div>
        </div>
    );
}
