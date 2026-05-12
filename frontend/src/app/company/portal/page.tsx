"use client";

import { useRouter } from "next/navigation";
import { UserNav, UserNavPage } from "@/src/components/figma/UserNav"; // Import the type here
import { CompanyPortal } from "@/src/components/figma/CompanyPortal";

export default function CompanyPortalPage() {
  const router = useRouter();

  const handleNavigate = (page: UserNavPage) => {
    if (page === "landing") router.push("/");
    if (page === "dashboard") router.push("/user/dashboard");
    if (page === "templates") router.push("/templates/showcase?from=dashboard");
    if (page === "courses") router.push("/courses");
    if (page === "job-board") router.push("/job-board");
    if (page === "user-profile") router.push("/user/profile");
    if (page === "company-profile") router.push("/company/profile");
    if (page === "company") router.push("/company/portal");
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