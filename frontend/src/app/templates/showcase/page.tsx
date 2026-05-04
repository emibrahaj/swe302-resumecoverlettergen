"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {TemplateGallery} from "@/src/components/figma/TemplateGallery";
import {UserNav} from "@/src/components/figma/UserNav";

export default function TemplatesShowcasePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    let backTarget = "/";
    if (from === "home")
        backTarget = "/";
    else
        backTarget = "/user/dashboard"
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
                <TemplateGallery
                    onBack={() => router.push(backTarget)}
                    onViewAll={() => router.push(`/templates/all?from=${from || "home"}`)}
                    onSelectTemplate={(templateId: string) =>
                        router.push(`/create/resume?template=${templateId}`)
                    }
                />
            </main>
        </>
    );
}