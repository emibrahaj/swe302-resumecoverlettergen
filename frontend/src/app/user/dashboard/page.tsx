"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/src/components/figma/Dashboard";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { useSubscription } from "@/src/context/SubscriptionContext";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
import {Footer} from "@/src/components/figma/Footer";

export default function UserDashboard() {
    const router = useRouter();
    const { isPro, refresh, setOptimisticPro } = useSubscription();

    // Dev-only toggle
    const handleTogglePlan = async () => {
        try {
            if (isPro) {
                await api.post("/payments/cancel");
                toast.success("Downgraded to Free");
            } else {
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

    return (
        <>
            <AuthAwareNav currentPage="dashboard" />
            <main className="pt-16">
                <Dashboard
                    onCreateNew={() => router.push("/templates/showcase?from=dashboard")}
                    onEditResume={(resumeId) => router.push(`/edit/resume?id=${resumeId}`)}
                    onEditCoverLetter={(coverLetterId) => router.push(`/edit/cover-letter?id=${coverLetterId}`)}
                    onCreateCoverLetter={() => router.push("/create/cover-letter")}
                    onUpgrade={() => router.push("/pricing")}
                    onAnalyzeResume={() => router.push("/user/analyze-resume")}
                    onSubmitReview={() => router.push("/submit-review")}
                    isPro={isPro}
                    onTogglePlan={handleTogglePlan}
                    onViewApplications={() => router.push("/user/applications")}
                />
            </main>
            <Footer />
        </>
    );
}