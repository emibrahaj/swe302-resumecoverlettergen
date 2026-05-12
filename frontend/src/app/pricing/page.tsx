"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {PublicUserNav} from "@/src/components/figma/PublicUserNav";
import {Pricing} from "@/src/components/figma/Pricing";
import {UserNav, type UserNavPage} from "@/src/components/figma/UserNav";
import {Footer} from "@/src/components/figma/Footer";
import {AuthModal} from "@/src/components/figma/AuthModal";
import {useState} from "react";


export default function PricingPage() {
    const router = useRouter();
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    const openLogin = () => {
        setAuthMode("login");
        setAuthOpen(true);
    };

    const openSignup = () => {
        setAuthMode("signup");
        setAuthOpen(true);
    };

    const closeAuth = () => {
        setAuthOpen(false);
    };
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
                    currentPage="pricing"
                    onNavigate={handleNavigate}
                    isCompany={false}
                    onLogout={() => router.push("/")}
                />
            ) : (
                <PublicUserNav currentPage="pricing"/>
            )}

            <main className="pt-16">
                <Pricing/>
            </main>
            <Footer/>
             <AuthModal
                isOpen={authOpen}
                onClose={closeAuth}
                initialMode={authMode}
                onComplete={() => router.push("/user/dashboard")}
                onForgotPassword={() => {
                    closeAuth();
                    router.push("/user/forgot-password");
                }}
            />

        </>
    );
}
