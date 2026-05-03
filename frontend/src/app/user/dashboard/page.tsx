"use client";

import {useRouter} from "next/navigation";
import {Dashboard} from "@/src/components/figma/Dashboard";
import {UserNav} from "@/src/components/figma/UserNav";

export default function UserDashboard() {
    const router = useRouter();

    const handleNavigate = (page:
    | "dashboard"
    | "templates"
    | "company"
    | "landing"
    | "job-board"
    | "user-profile"
    | "company-profile") => {
        if (page === "landing") router.push("/");
        if (page === "company") router.push("/company/portal");
        if (page === "company-profile") router.push("/company/profile");
        if (page === "job-board") router.push("/job-board?from=dashboard");
        if (page === "dashboard") router.push("/user/dashboard");
        if (page === "user-profile") router.push("/user/profile");
        if (page === "templates") router.push("/templates/showcase?from=dashboard");

    };

    return (<>
        <UserNav currentPage="dashboard" onNavigate={handleNavigate} isCompany={false}
                 onLogout={() => router.push("/")}/>
        <main className="pt-16">
            <Dashboard
                onCreateNew={() => router.push("/templates/showcase?from=dashboard")}
                onEditResume={() => router.push("/edit/resume")}
                onCreateCoverLetter={() => router.push("/create/cover-letter")}
                onUpgrade={() => router.push("/pricing?from=dashboard")}
                onAnalyzeResume={() => router.push("/user/analyze-resume")}
                onSubmitReview={() => router.push("/submit-review")}
            />
        </main>
    </>)
}

//TODO maybe add a select main resume button or a drop down menu to select the resume u want to analyze