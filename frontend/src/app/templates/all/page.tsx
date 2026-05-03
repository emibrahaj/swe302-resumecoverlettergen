"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {TemplatesShowcase} from "@/src/components/figma/TemplatesShowcase";
import {UserNav} from "@/src/components/figma/UserNav";

export default function AllTemplatesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const backTarget = from === "dashboard" ? "user/dashboard" : "/";

    const handleNavigate = (
        page: "dashboard" | "templates" | "company" | "landing" | "job-board"
    ) => {
        if (page === "landing") router.push("/");
        if (page === "company") router.push("/company/portal");
        if (page === "job-board") router.push("/job-board");
        if (page === "dashboard") router.push("/user/dashboard");
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
                <TemplatesShowcase
                    onBack={() => router.push(backTarget)}
                    onSelectTemplate={(templateId: string) =>
                        router.push(`/create/resume?template=${templateId}`)
                    }
                />
            </main>

        </>
    );
}