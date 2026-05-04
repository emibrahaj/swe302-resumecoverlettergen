"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {TemplatesShowcase} from "@/src/components/figma/TemplatesShowcase";
import {UserNav, type UserNavPage} from "@/src/components/figma/UserNav";
import {PublicUserNav} from "@/src/components/figma/PublicUserNav";

export default function AllTemplatesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get("from");
    const isFromDashboard = from === "dashboard";

    const handleNavigate = (page: UserNavPage) => {
        if (page === "landing") router.push("/");
        if (page === "dashboard") router.push("/user/dashboard");
        if (page === "templates") router.push("/templates/showcase?from=dashboard");
        if (page === "courses") router.push("/courses?from=dashboard");
        if (page === "job-board") router.push("/job-board?from=dashboard");
        if (page === "user-profile") router.push("/user/profile");
        if (page === "company-profile") router.push("/company/profile");
        if (page === "company") router.push("/company/portal");
    };

    return (
        <>
            {isFromDashboard ? (
                <UserNav
                    currentPage="templates"
                    onNavigate={handleNavigate}
                    isCompany={false}
                    onLogout={() => router.push("/")}
                />
            ) : (
                <PublicUserNav currentPage="templates"/>
            )}

            <main className="pt-16">
                <TemplatesShowcase
                    onSelectTemplate={(templateId: string) =>
                        router.push(
                            `/create/resume?template=${templateId}${
                                isFromDashboard ? "&from=dashboard" : ""
                            }`
                        )
                    }
                />
            </main>
        </>
    );
}