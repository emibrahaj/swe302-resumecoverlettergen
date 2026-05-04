"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Courses } from "@/src/components/figma/Courses";
import { UserNav, type UserNavPage } from "@/src/components/figma/UserNav";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isFromDashboard = from === "dashboard";

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
      {isFromDashboard ? (
        <UserNav
          currentPage="courses"
          onNavigate={handleNavigate}
          isCompany={false}
          onLogout={() => router.push("/")}
        />
      ) : (
        <PublicUserNav currentPage="courses" />
      )}

      <main className="pt-16">
        <Courses />
      </main>
    </>
  );
}
