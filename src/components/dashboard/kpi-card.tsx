import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    title: string;
    value: string | number;
    label?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: "blue" | "cyan" | "danger" | "emerald";
}

export function KpiCard({ title, value, label, icon: Icon, trend, trendValue, color = "blue" }: KpiCardProps) {
    const colorStyles = {
        blue: "text-fordrax-blue hover:border-fordrax-blue/50 group-hover:shadow-glow-blue",
        cyan: "text-fordrax-cyan hover:border-fordrax-cyan/50 group-hover:shadow-glow-cyan",
        danger: "text-fordrax-danger hover:border-fordrax-danger/50 group-hover:shadow-glow-red",
        emerald: "text-emerald-500 hover:border-emerald-500/50 group-hover:shadow-glow-emerald",
    };

    const bgStyles = {
        blue: "bg-fordrax-blue/10",
        cyan: "bg-fordrax-cyan/10",
        danger: "bg-fordrax-danger/10",
        emerald: "bg-emerald-500/10",
    };

    return (
        <div className={cn(
            "bg-fordrax-panel/80 p-6 rounded-2xl border border-white/5 transition-all duration-300 group",
            colorStyles[color].split(" ")[1],
            colorStyles[color].split(" ")[2]
        )}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-fordrax-titanium">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className={cn("text-3xl font-bold", colorStyles[color].split(" ")[0])}>
                            {value}
                        </h3>
                        {label && <span className="text-sm text-fordrax-titanium">{label}</span>}
                    </div>
                </div>
                <div className={cn("p-3 rounded-lg", bgStyles[color])}>
                    <Icon className={cn("w-6 h-6", colorStyles[color].split(" ")[0])} />
                </div>
            </div>

            {trendValue && (
                <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className={cn(
                        "font-medium",
                        trend === "up" ? "text-emerald-400" : trend === "down" ? "text-fordrax-danger" : "text-fordrax-titanium"
                    )}>
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {trendValue}
                    </span>
                    <span className="text-fordrax-titanium/70">vs last month</span>
                </div>
            )}
        </div>
    );
}
