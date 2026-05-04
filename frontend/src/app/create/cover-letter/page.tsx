"use client";

import { useRouter } from "next/navigation";
import { CoverLetterBuilder } from "@/src/components/figma/CoverLetterBuilder";
import { UserNav, type UserNavPage } from "@/src/components/figma/UserNav";

export default function CreateCoverLetterPage() {
  const router = useRouter();

  const handleNavigate = (page: UserNavPage) => {
    if (page === "landing") router.push("/");
    if (page === "dashboard") router.push("/user/dashboard");
    if (page === "templates") router.push("/templates/showcase?from=dashboard");
    if (page === "courses") router.push("/courses?from=dashboard");
    if (page === "job-board") router.push("/job-board?from=dashboard");
    if (page === "user-profile") router.push("/user/profile");
    if (page === "company-profile") router.push("/company/profile");
    if (page === "company") router.push("/company/portal");
  };

  return (
    <>
      <UserNav
        currentPage="cover-letter"
        onNavigate={handleNavigate}
        isCompany={false}
        onLogout={() => router.push("/")}
      />

      <main className="pt-16">
        <CoverLetterBuilder />
      </main>
    </>
  );
}
