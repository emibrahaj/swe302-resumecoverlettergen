"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/src/components/figma/Dashboard";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { useSubscription } from "@/src/context/SubscriptionContext";
import {Footer} from "@/src/components/figma/Footer";

export default function UserDashboard() {
    const router = useRouter();
    const { isPro } = useSubscription();

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
                    onViewJobBoard={() => router.push("/user/matched-jobs")}
                />
            </main>
            <Footer />
        </>
    );
}