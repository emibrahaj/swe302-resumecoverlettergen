"use client";

import {useRouter} from "next/navigation";
import {Dashboard} from "../../../components/figma/Dashboard";
import {UserNav} from "@/src/components/figma/UserNav";

export default function UserDashboard(){
    const router = useRouter();

    const handleNavigate = (page: "dashboard" | "templates" | "company" | "landing" | "job-board") => {
        if (page === "landing") router.push("/");
        if (page === "company") router.push("/company/portal");
        if (page === "job-board") router.push("/find-jobs");
        if (page === "dashboard") router.push("/dashboard");
        if (page === "templates") router.push("/templates");
    };

    return (
        <>
            <UserNav currentPage="dashboard" onNavigate={handleNavigate} isCompany={false} onLogout={() => router.push("/")} />
            <main className="pt-16">
                <Dashboard
                    onCreateNew={() => router.push("/templates/showcase")}
                    onEditResume={() => router.push("/edit/resume")}
                    onCreateCoverLetter={() => router.push("/create/cover-letter")}
                    onUpgrade={() => router.push("/pricing")}
                    onAnalyzeResume={() => router.push("/analyze/resume")}
                    onSubmitReview={() => router.push("/submit-review")}

                />
            </main>
        </>
    )
}