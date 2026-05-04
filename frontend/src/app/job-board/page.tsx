"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { JobBoard } from "@/src/components/figma/JobBoard";
import { UserNav } from "@/src/components/figma/UserNav";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";

export default function JobBoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const isFromDashboard = from === "dashboard";

  let backTarget = "/";

  if (from === "dashboard") {
    backTarget = "/user/dashboard";
  } else {
    backTarget = "/";
  }

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
    if (page === "courses") router.push("/courses?from=dashboard");
    if (page === "job-board") router.push("/job-board?from=dashboard");
    if (page === "user-profile") router.push("/user/profile");
    if (page === "company-profile") router.push("/company/profile");
    if (page === "company") router.push("/company/portal");
  };

  return (
    <>
      {isFromDashboard ? (
        <UserNav
          currentPage="job-board"
          onNavigate={handleNavigate}
          isCompany={false}
          onLogout={() => router.push("/")}
        />
      ) : (
        <PublicUserNav currentPage="job-board" />
      )}

      <main className="pt-16">
        <JobBoard
          onBack={() => router.push(backTarget)}
          onUpgrade={() => router.push("/pricing?from=job-board")}
        />
      </main>
    </>
  );
}