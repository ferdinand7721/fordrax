import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { CertificateTemplate } from "@/components/certificate/certificate-template";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PrintButton } from "@/components/certificate/print-button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: certificate, error } = await supabase
        .from("certificates")
        .select(`
            *,
            modules (title),
            orgs (display_name),
            profiles:user_id (full_name)
        `)
        .eq("id", id)
        .single();

    if (error || !certificate) {
        console.error("Certificate not found:", error);
        notFound();
    }

    // Access Check (Basic: Owner Only or needs admin policy)
    // Simple check: if not owner, 404/redirect (unless admin, but simplifying for now)
    if (certificate.user_id !== user.id) {
        // TODO: Add Admin check logic here
        redirect("/library");
    }

    const issuedDate = new Date(certificate.issued_at).toLocaleDateString("en-US", {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="flex min-h-screen bg-fordrax-black text-white">
            <div className="print:hidden fixed inset-y-0 left-0 w-64">
                <Sidebar />
            </div>

            <div className="flex-1 ml-64 flex flex-col print:ml-0 print:w-full">
                <div className="print:hidden">
                    <Topbar />
                </div>

                <main className="flex-1 p-8 flex flex-col items-center">
                    <div className="print:hidden w-full max-w-5xl flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Certificate Issued</h1>
                            <p className="text-gray-400">Official proof of completion.</p>
                        </div>
                        <div className="flex gap-4">
                            <PrintButton />
                        </div>
                    </div>

                    <div className="w-full overflow-auto print:overflow-visible">
                        <CertificateTemplate
                            userName={certificate.profiles?.full_name || "Fordrax User"}
                            courseTitle={certificate.modules?.title || "Security Module"}
                            issuedAt={issuedDate}
                            certificateUuid={certificate.certificate_uuid}
                            hash={certificate.hash_sha256}
                            orgName={certificate.orgs?.display_name || "Fordrax Corp"}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
