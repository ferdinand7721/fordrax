"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight, ShieldAlert } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Login Error:", error.message);
                setError(error.message);
                setLoading(false);
                return;
            }

            router.refresh(); // Refresh Server Components
            router.push("/");

        } catch (err) {
            setError("An unexpected error occurred. Check console.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-fordrax-black text-white">
            {/* Left: Branding Hero */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-fordrax-panel items-center justify-center p-12">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fordrax-blue/20 via-fordrax-black to-fordrax-black" />
                <div className="relative z-10 max-w-lg space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-fordrax-titanium bg-clip-text text-transparent">
                            FORDRAX
                        </h1>
                        <p className="text-2xl mt-4 text-fordrax-cyan font-light tracking-wide">
                            CIBERCONCIENCIA
                        </p>
                        <div className="h-1 w-24 bg-fordrax-blue mt-6 rounded-full" />
                        <p className="mt-8 text-fordrax-titanium text-lg leading-relaxed">
                            Elevating corporate security culture through agentic intelligence and zero-trust principles.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Access Command Center</h2>
                        <p className="mt-2 text-sm text-fordrax-titanium">
                            Enter your credentials to access the secure environment.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-fordrax-titanium">Email Address</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-fordrax-titanium" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-fordrax-panel border border-white/10 rounded-lg focus:ring-2 focus:ring-fordrax-blue focus:border-transparent placeholder-fordrax-titanium/50 text-white transition-all outline-none"
                                        placeholder="admin@fordrax.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-fordrax-titanium">Password</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-fordrax-titanium" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-fordrax-panel border border-white/10 rounded-lg focus:ring-2 focus:ring-fordrax-blue focus:border-transparent placeholder-fordrax-titanium/50 text-white transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-fordrax-danger/10 border border-fordrax-danger/20 rounded-lg text-sm text-fordrax-danger flex items-start gap-3 animate-pulse">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold block">Access Denied</span>
                                    {error}
                                    {error.includes("Email not confirmed") && (
                                        <p className="mt-1 text-xs opacity-80">
                                            Please check your inbox or disable "Confirm Email" in Supabase Auth Settings.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-fordrax-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fordrax-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Authenticate <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
