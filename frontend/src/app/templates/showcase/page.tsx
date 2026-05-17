"use client";

import { useRouter } from "next/navigation";
import { TemplateGallery } from "@/src/components/figma/TemplateGallery";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import {Footer} from "@/src/components/figma/Footer";

export default function TemplatesShowcasePage() {
  const router = useRouter();

  return (
    <>
      <AuthAwareNav currentPage="templates" publicCurrentPage="templates" onBack={() => router.back()} />
      <main className="pt-16">
        <TemplateGallery
          onViewAll={() => router.push("/templates/all")}
          onSelectTemplate={(template_key: string) => router.push(`/create/resume?template=${template_key}`)}
        />
      </main>
        <Footer />
    </>
  );
}