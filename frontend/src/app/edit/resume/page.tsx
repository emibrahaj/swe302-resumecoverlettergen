"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CVBuilder } from "@/src/components/figma/CVBuilder";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { TEMPLATES } from "@/src/config/templates.config";
import { useSubscription } from "@/src/context/SubscriptionContext";

export default function EditResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";
  const resumeId = searchParams.get("id") || undefined;
  const { isPro, loading: subLoading } = useSubscription();

  useEffect(() => {
    if (subLoading) return;
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (t?.isPremium && !isPro) {
      toast.info("That template is Pro-only. Upgrade to unlock it.");
      router.replace("/pricing?from=template-direct");
    }
  }, [templateId, isPro, subLoading, router]);

  return (
    <>
      <AuthAwareNav currentPage="dashboard" />

      <main className="pt-16">
        <CVBuilder
          templateId={templateId}
          resumeId={resumeId}
          onBack={() => router.push("/templates/all")}
        />
      </main>
    </>
  );
}
