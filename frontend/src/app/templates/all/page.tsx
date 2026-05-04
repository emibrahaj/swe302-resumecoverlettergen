"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {TemplatesShowcase} from "@/src/components/figma/TemplatesShowcase";
import {UserNav} from "@/src/components/figma/UserNav";

export default function AllTemplatesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    let backTarget = "/";
    if (from === "dashboard")
        backTarget = "/user/dashboard";
    else
        backTarget = "/";

    const handleNavigate = (
        page:
            | "dashboard"
            | "templates"
            | "courses"
            | "company"
            | "landing"
            | "job-board"
            | "user-profile"
            | "company-profile"
    ) => {
        if (page === "landing") router.push("/");
        if (page === "dashboard") router.push("/user/dashboard");
        if (page === "templates") router.push("/templates/showcase?from=dashboard");
        if (page === "courses") router.push("/courses");
        if (page === "job-board") router.push("/job-board");
        if (page === "user-profile") router.push("/user/profile");
        if (page === "company-profile") router.push("/company/profile");
        if (page === "company") router.push("/company/portal");
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