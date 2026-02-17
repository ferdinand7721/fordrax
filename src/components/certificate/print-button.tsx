"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-fordrax-blue text-white rounded-lg hover:bg-white hover:text-black transition-all font-bold shadow-[0_0_20px_rgba(0,87,255,0.3)]"
        >
            <Printer className="w-5 h-5" />
            Download / Print PDF
        </button>
    );
}
