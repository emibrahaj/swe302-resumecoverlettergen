"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CVBuilder } from "@/src/components/figma/CVBuilder";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";

export default function EditResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";

  return (
    <>
      <AuthAwareNav currentPage="dashboard" />

      <main className="pt-16">
        <CVBuilder
          templateId={templateId}
          onBack={() => router.push("/templates/all")}
        />
      </main>
    </>
  );
}
