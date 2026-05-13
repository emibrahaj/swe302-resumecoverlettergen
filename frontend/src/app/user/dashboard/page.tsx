"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/src/components/figma/Dashboard";
import { UserNav } from "@/src/components/figma/UserNav";
import { clearAuthTokens } from "@/src/hooks/useAuth";
import { useSubscription } from "@/src/context/SubscriptionContext";
import { api } from "@/src/lib/api";
import { toast } from "sonner";

export default function UserDashboard() {
    const router = useRouter();
    const { isPro, refresh, setOptimisticPro } = useSubscription();

    // Dev-only toggle: hit /payments/cancel or simulate Pro to make UI iteration easier
    const handleTogglePlan = async () => {
        try {
            if (isPro) {
                await api.post("/payments/cancel");
                toast.success("Downgraded to Free");
            } else {
                // Quick dev-mode self-upgrade: create + confirm a Weekly subscription
                const c = await api.post<{ subscription_id: string }>("/payments/create-subscription", { plan_id: "weekly" });
                await api.post(`/payments/confirm-subscription/${c.subscription_id}`);
                toast.success("Upgraded to Pro (dev)");
            }
            setOptimisticPro(!isPro);
            refresh();
        } catch {
            toast.error("Couldn't toggle plan — try the /pricing checkout flow instead");
        }
    };

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
            | "pricing"
    ) => {
        if (page === "landing") router.push("/");
        if (page === "dashboard") router.push("/user/dashboard");
        if (page === "templates") router.push("/templates/showcase?from=dashboard");
        if (page === "courses") router.push("/courses?from=dashboard");
        if (page === "job-board") router.push("/job-board?from=dashboard");
        if (page === "user-profile") router.push("/user/profile");
        if (page === "company-profile") router.push("/company/profile");
        if (page === "company") router.push("/company/portal");
        if (page === "pricing") router.push("/pricing");

    };

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