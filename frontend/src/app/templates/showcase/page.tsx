"use client";

import {useRouter} from "next/navigation";
import {TemplateGallery} from "@/src/components/figma/TemplateGallery";
import {UserNav} from "@/src/components/figma/UserNav";

export default function TemplatesShowcasePage() {
    const router = useRouter();

    const handleNavigate = (
        page: "dashboard" | "templates" | "company" | "landing" | "job-board"
    ) => {
        if (page === "landing") router.push("/");
        if (page === "company") router.push("/company/portal");
        if (page === "job-board") router.push("/jobs");
        if (page === "dashboard") router.push("/dashboard");
        if (page === "templates") router.push("/templates/showcase");
    };

    return (
        <>
            <UserNav
                currentPage="templates"
                onNavigate={handleNavigate}
                isCompany={false}
                onLogout={() => router.push("/")}
            />

            <main className="pt-16">
                <TemplateGallery
                    onBack={() => router.push("/")}
                    onViewAll={() => router.push("/templates/all")}
                    onSelectTemplate={(templateId: string) =>
                        router.push(`/create/resume?template=${templateId}`)
                    }
                />
            </main>
        </>
    );
}