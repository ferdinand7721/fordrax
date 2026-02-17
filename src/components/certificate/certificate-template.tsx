import { cn } from "@/lib/utils";
import { ShieldCheck, Fingerprint } from "lucide-react";

interface CertificateTemplateProps {
    userName: string;
    courseTitle: string;
    issuedAt: string; // Formatted date
    certificateUuid: string;
    hash: string;
    orgName: string;
}

export function CertificateTemplate({ userName, courseTitle, issuedAt, certificateUuid, hash, orgName }: CertificateTemplateProps) {
    return (
        <div className="w-[1123px] h-[794px] bg-white text-black relative overflow-hidden mx-auto shadow-2xl p-0 print:shadow-none print:w-full print:h-full print:m-0">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0" />

            {/* Security Border */}
            <div className="absolute inset-4 border-4 border-fordrax-black/80 z-10" />
            <div className="absolute inset-6 border border-fordrax-black/20 z-10" />

            {/* Content Container */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-16 py-12">

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-fordrax-black text-white flex items-center justify-center rounded">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase font-mono">Fordrax CyberAwareness</h1>
                    </div>
                    <div className="w-32 h-1 bg-gradient-to-r from-fordrax-blue to-fordrax-cyan mx-auto rounded-full" />
                </div>

                <h2 className="text-xl text-gray-500 uppercase tracking-widest mb-2 font-serif">Certificate of Completion</h2>
                <p className="text-sm text-gray-400">Awarded to</p>

                {/* Name */}
                <h3 className="text-5xl font-bold text-fordrax-blue my-8 font-serif italic border-b-2 border-dashed border-gray-200 pb-2 px-12 inline-block">
                    {userName}
                </h3>

                <p className="text-lg text-gray-600 mb-2">For successfully completing the high-security training module:</p>
                <h4 className="text-3xl font-bold text-black mb-8 max-w-3xl">{courseTitle}</h4>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 w-full max-w-2xl mt-8">
                    <div className="text-right border-r border-gray-200 pr-12">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Authorized By</p>
                        <p className="font-bold text-lg mt-1">{orgName}</p>
                        <p className="text-xs text-gray-500">Security Department</p>
                    </div>
                    <div className="text-left pl-0">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Issued On</p>
                        <p className="font-bold text-lg mt-1">{issuedAt}</p>
                        <p className="text-xs text-gray-500">UTC Standard Time</p>
                    </div>
                </div>

                {/* Footer / Verification */}
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-gray-100 pt-6">
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-mono mb-1">CERTIFICATE ID: <span className="text-black">{certificateUuid}</span></p>
                        <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <Fingerprint className="w-3 h-3" />
                            HASH: <span className="text-[9px] text-gray-600 break-all">{hash}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400">Verified by Fordrax Solutions Chain</p>
                        <p className="text-[10px] text-fordrax-blue font-bold">fordrax.com/verify</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
