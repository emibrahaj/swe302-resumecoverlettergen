"use client";

import { useRouter } from "next/navigation";
import { UserNav } from "../../../components/figma/UserNav";
import { CompanyPortal } from "../../../components/figma/CompanyPortal";

export default function CompanyPortalPage() {
  const router = useRouter();

  const handleNavigate = (
    page: "dashboard" | "templates" | "company" | "landing" | "job-board"
  ) => {
    if (page === "landing") {
      router.push("/");
    }

    if (page === "company") {
      router.push("/company/portal");
    }

    if (page === "job-board") {
      router.push("/jobs");
    }

    if (page === "dashboard") {
      router.push("/dashboard");
    }

    if (page === "templates") {
      router.push("/templates");
    }
  };

  return (
    <>
      <UserNav
        currentPage="company"
        onNavigate={handleNavigate}
        isCompany={true}
        onLogout={() => router.push("/")}
      />

      <div className="pt-16">
        <CompanyPortal />
      </div>
    </>
  );
}