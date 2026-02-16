"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-fordrax-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-fordrax-panel/80 p-8 rounded-2xl border border-fordrax-danger/30 max-w-md w-full shadow-[0_0_30px_rgba(255,51,51,0.1)]">
                <div className="w-16 h-16 bg-fordrax-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-fordrax-danger" />
                </div>
                <h2 className="text-2xl font-bold mb-2">System Malfunction</h2>
                <p className="text-fordrax-titanium mb-6">
                    A critical error prevented the interface from loading.
                    <br />
                    <span className="font-mono text-xs text-fordrax-danger mt-2 block bg-black/30 p-2 rounded">
                        Error: {error.message || "Unknown Exception"}
                    </span>
                </p>
                <button
                    onClick={() => reset()}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-3 rounded-lg font-bold transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Reboot System
                </button>
            </div>
        </div>
    );
}
