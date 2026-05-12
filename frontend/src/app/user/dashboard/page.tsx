"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Dashboard} from "@/src/components/figma/Dashboard";
import {UserNav, UserNavPage} from "@/src/components/figma/UserNav";
import {clearAuthTokens} from "@/src/hooks/useAuth";

export default function UserDashboard() {
    const router = useRouter();
    const [isPro, setIsPro] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("plan") === "pro";
        }
        return false;
    });

    const handleTogglePlan = () => {
        setIsPro(prev => {
            const next = !prev;
            localStorage.setItem("plan", next ? "pro" : "free");
            return next;
        });
    };

    const handleNavigate = (page: UserNavPage) => { // Use the type here!
        switch (page) {
            case "landing":
                router.push("/");
                break;
            case "dashboard":
                router.push("/user/dashboard");
                break;
            case "templates":
                router.push("/create/cover-letter");
                break;
            case "courses":
                router.push("/courses?from=dashboard");
                break;
            case "job-board":
                router.push("/job-board?from=dashboard");
                break;
            case "pricing":
                router.push("/pricing");
                break; // Handle pricing
            case "user-profile":
                router.push("/user/profile");
                break;
            case "company-profile":
                router.push("/company/profile");
                break;
            case "company":
                router.push("/company/portal");
                break;
            default:
                // This catches any stray values and makes TS happy
                console.warn("Unhandled navigation page:", page);
        }

        const handleLogout = () => {
            clearAuthTokens();
            router.push("/");
        };

        return (
            <>
                <UserNav
                    currentPage="dashboard"
                    onNavigate={handleNavigate}
                    isCompany={false}
                    onLogout={handleLogout}
                    isPro={isPro}
                />
                <main className="pt-16">
                    <Dashboard
                        onCreateNew={() => router.push("/templates/showcase?from=dashboard")}
                        onEditResume={() => router.push("/edit/resume")}
                        onCreateCoverLetter={() => router.push("/create/cover-letter")}
                        onUpgrade={() => router.push("/pricing?from=dashboard")}
                        onAnalyzeResume={() => router.push("/user/analyze-resume")}
                        onSubmitReview={() => router.push("/submit-review")}
                        isPro={isPro}
                        onTogglePlan={handleTogglePlan}
                    />
                </main>
            </>
        );
    }
}