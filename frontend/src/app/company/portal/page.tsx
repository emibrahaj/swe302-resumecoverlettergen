"use client";

import { useRouter } from "next/navigation";
import { UserNav } from "../../../components/figma/UserNav";
import { CompanyPortal } from "../../../components/figma/CompanyPortal";

export default function CompanyPortalPage() {
  const router = useRouter();

  const handleNavigate = (
  page:
    | "dashboard"
    | "templates"
    | "courses"
    | "company"
    | "landing"
    | "job-board"
    | "user-profile"
    | "company-profile"
) => {
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