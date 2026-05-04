"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {PublicUserNav} from "@/src/components/figma/PublicUserNav";
import {SubscriptionPlans} from "@/src/components/figma/SubscriptionPlans";
import {UserNav} from "@/src/components/figma/UserNav";

export default function PricingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get("from");

    const isFromDashboard = from === "dashboard";

    let backTarget = "/";

    if (from === "dashboard") {
        backTarget = "/user/dashboard";
    } else if (from === "job-board") {
        backTarget = "/jobs";
    } else {
        backTarget = "/";
    }

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
            {isFromDashboard ? (
                <UserNav
                    currentPage="pricing"
                    onNavigate={handleNavigate}
                    isCompany={false}
                    onLogout={() => router.push("/")}
                />
            ) : (
                <PublicUserNav/>
            )}

            <main className="pt-16">
                <SubscriptionPlans
                    onBack={() => router.push(backTarget)}
                    onSelectPlan={() => router.push("/payment")}
                />
            </main>
        </>
    );
}

