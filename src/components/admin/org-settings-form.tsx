"use client";

import { useState } from "react";
import { updateOrgSettings } from "@/lib/actions/admin";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrgSettingsFormProps {
    org: any;
}

export function OrgSettingsForm({ org }: OrgSettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Simple state, could be react-hook-form
    const [formData, setFormData] = useState({
        display_name: org.display_name || "",
        legal_type: org.legal_type || "persona_moral",
        rfc: org.rfc || "",
        company_name: org.company_name || "",
        difficulty_level: org.difficulty_level || "basic"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateOrgSettings(org.id, formData);
            if (res.success) {
                alert("Settings updated successfully.");
                router.refresh();
            } else {
                alert("Error updating settings: " + res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Unexpected error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-fordrax-titanium mb-1">Display Name</label>
                    <input
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fordrax-blue outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-fordrax-titanium mb-1">Difficulty Level</label>
                    <select
                        name="difficulty_level"
                        value={formData.difficulty_level}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fordrax-blue outline-none"
                    >
                        <option value="basic">Basic (Standard)</option>
                        <option value="medium">Medium (Advanced Users)</option>
                        <option value="advanced">Advanced (IT/Sec)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-fordrax-titanium mb-1">Legal Type</label>
                    <select
                        name="legal_type"
                        value={formData.legal_type}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fordrax-blue outline-none"
                    >
                        <option value="persona_moral">Persona Moral (Company)</option>
                        <option value="persona_fisica">Persona Física (Individual)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-fordrax-titanium mb-1">RFC (Tax ID)</label>
                    <input
                        name="rfc"
                        value={formData.rfc}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fordrax-blue outline-none uppercase"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-fordrax-titanium mb-1">Legal Company Name (Razón Social)</label>
                    <input
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fordrax-blue outline-none"
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-fordrax-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Settings
                </button>
            </div>
        </form>
    );
}
