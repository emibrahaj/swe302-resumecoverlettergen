"use client";

import {useRouter} from "next/navigation";
import {ResumeAnalyzer} from "@/src/components/figma/ResumeAnalyzer";
import {UserNav} from "@/src/components/figma/UserNav";

export default function ResumeAnalyzerPage() {
    const router = useRouter();
    const handleNavigate = (page: "dashboard" | "templates" | "company" | "landing" | "job-board") => {
        if (page === "landing") router.push("/");
        if (page === "company") router.push("/company/portal");
        if (page === "job-board") router.push("/job-board?from=dashboard");
        if (page === "dashboard") router.push("/user/dashboard");
        if (page === "templates") router.push("/templates/showcase?from=dashboard");
    };
    return (
        <>
            <UserNav currentPage="dashboard" onNavigate={handleNavigate} isCompany={false}
                     onLogout={() => router.push("/")}/>
            <main className="pt-16">
                <ResumeAnalyzer
                    onBack={() => router.push("/user/dashboard")}
                    onUpgrade={() => router.push("/pricing?from=dashboard")}
                />
            </main>
        </>)
}