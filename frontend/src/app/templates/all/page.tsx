"use client";

import { useRouter } from "next/navigation";
import { TemplatesShowcase } from "@/src/components/figma/TemplatesShowcase";
import { UserNav } from "@/src/components/figma/UserNav";

export default function AllTemplatesPage() {
  const router = useRouter();

  const handleNavigate = (
    page: "dashboard" | "templates" | "company" | "landing" | "job-board"
  ) => {
    if (page === "landing") router.push("/");
    if (page === "company") router.push("/company/portal");
    if (page === "job-board") router.push("/find-jobs");
    if (page === "dashboard") router.push("/dashboard");
    if (page === "templates") router.push("/templates/showcase");
  };

  return (
    <>
      <UserNav
        currentPage="templates"
        onNavigate={handleNavigate}
        isCompany={false}
        onLogout={() => router.push("/")}
      />

      <main className="pt-16">
        <TemplatesShowcase
          onSelectTemplate={(templateId: string) =>
            router.push(`/create/resume?template=${templateId}`)
          }
        />
      </main>
    </>
  );
}