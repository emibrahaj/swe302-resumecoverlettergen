"use client";

import {useRouter} from "next/navigation";
import {clearAuthTokens, useAuth} from "@/src/hooks/useAuth";
import {UserNav, UserNavPage} from "./UserNav";
import {Navbar} from "./Navbar";
import {useModals} from "@/src/context/ModalContext";

interface AuthAwareNavProps {
    currentPage?: UserNavPage;
    publicCurrentPage?: "templates" | "courses" | "pricing" | "job-board";
    onBack?: () => void;
}

export function AuthAwareNav({
                                 currentPage,
                                 publicCurrentPage,
                             }: AuthAwareNavProps) {
    const router = useRouter();
    const {isAuthenticated, isLoading, isCompany} = useAuth();
    const {openLogin, openSignup} = useModals();

    if (isLoading) return null;

    if (isAuthenticated) {
        const isPro = typeof window !== "undefined" && localStorage.getItem("plan") === "pro";

        const handleNavigate = (page: UserNavPage) => {
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
                    break;
                case "user-profile":
                    router.push("/user/profile");
                    break;
                case "company-profile":
                    router.push("/company/profile");
                    break;
                case "company":
                    router.push("/company/portal");
                    break;
            }
        };

        const handleLogout = () => {
            clearAuthTokens();
            router.push("/");
        };

        return (
            <UserNav
                currentPage={currentPage ?? ""}
                onNavigate={handleNavigate}
                isCompany={isCompany}
                onLogout={handleLogout}
                isPro={isPro}
            />
        );
    }

    // Not authenticated — if homepage props provided, render full Navbar
    return (
        <Navbar
            onLoginClick={openLogin}
            onSignupClick={openSignup}
            currentPage={publicCurrentPage}
            onCoverLetterClick={() => router.push("/create/cover-letter")}
            onPricingClick={() => router.push("/pricing")}
            onJobsClick={() => router.push("/job-board")}
            onCoursesClick={() => router.push("/courses")}
            onCompanyClick={() => {
                if (window.location.pathname === "/") {
                    document.getElementById("for-companies")?.scrollIntoView({behavior: "smooth"});
                } else {
                    router.push("/#for-companies");
                }
            }}
        />
    );
}
