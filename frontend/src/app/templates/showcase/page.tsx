"use client";

import { useRouter } from "next/navigation";
import { TemplateGallery } from "@/src/components/figma/TemplateGallery";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";

export default function TemplatesShowcasePage() {
  const router = useRouter();

  return (
    <>
      <AuthAwareNav currentPage="templates" publicCurrentPage="templates" onBack={() => router.back()} />
      <main className="pt-16">
        <TemplateGallery
          onViewAll={() => router.push("/templates/all")}
          onSelectTemplate={(templateId: string) => router.push(`/create/resume?template=${templateId}`)}
        />
      </main>
    </>
  );
}