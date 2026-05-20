"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CVBuilder } from "@/src/components/figma/CVBuilder";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { useTemplate } from "@/src/hooks/useTemplates";
import { useSubscription } from "@/src/context/SubscriptionContext";

function EditResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateKey = searchParams.get("template") || "modern_minimal";
  const resumeId = searchParams.get("id") || undefined;
  const { isPro, loading: subLoading } = useSubscription();
  const { template: dbTemplate, loading: templateLoading } = useTemplate(templateKey);

  useEffect(() => {
    if (subLoading || templateLoading || !dbTemplate) return;
    if (dbTemplate.is_premium && !isPro) {
      toast.info("That template is Pro-only. Upgrade to unlock it.");
      router.replace("/pricing?from=template-direct");
    }
  }, [dbTemplate, isPro, subLoading, templateLoading, router]);

  return (
    <>
      <AuthAwareNav currentPage="dashboard" />
      <main className="pt-16">
        <CVBuilder
          templateId={templateKey}
          resumeId={resumeId}
          onBack={() => router.push("/templates/all")}
        />
      </main>
    </>
  );
}

export default function EditResumePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <EditResumeContent />
    </Suspense>
  );
}