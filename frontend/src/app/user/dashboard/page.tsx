"use client";

import {useRouter} from "next/navigation";
import {Dashboard} from "@/src/components/figma/Dashboard";
import {UserNav} from "@/src/components/figma/UserNav";
import {clearAuthTokens} from "@/src/hooks/useAuth";

export default function UserDashboard() {
    const router = useRouter();

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
        if (page === "courses") router.push("/courses?from=dashboard");
        if (page === "job-board") router.push("/job-board?from=dashboard");
        if (page === "user-profile") router.push("/user/profile");
        if (page === "company-profile") router.push("/company/profile");
        if (page === "company") router.push("/company/portal");
    };

    const handleLogout = () => {
        clearAuthTokens();
        router.push("/");
    };

    return (<>
        <UserNav
            currentPage="dashboard"
            onNavigate={handleNavigate}
            isCompany={false}
            onLogout={handleLogout}
        />
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
