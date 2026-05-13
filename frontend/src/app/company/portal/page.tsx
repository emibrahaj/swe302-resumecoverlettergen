"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserNav, UserNavPage } from "@/src/components/figma/UserNav";
import { CompanyPortal } from "@/src/components/figma/CompanyPortal";
import { useAuth, clearAuthTokens } from "@/src/hooks/useAuth";

export default function CompanyPortalPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isCompany } = useAuth();

  // Guard: only authenticated company accounts may access the portal.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      toast.info("Please log in to your company account to access the portal.");
      router.replace("/company/login");
      return;
    }
    if (!isCompany) {
      toast.error("This portal is for company accounts only. Sign out first to access the company login.");
      router.replace("/user/dashboard");
    }
  }, [isAuthenticated, isCompany, isLoading, router]);

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

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/company/login");
  };

  // While we resolve auth state, render a tiny placeholder to avoid a flash
  // of the portal for unauthenticated users.
  if (isLoading || !isAuthenticated || !isCompany) {
    return (
      <main className="min-h-screen flex items-center justify-center text-foreground/60">
        Checking your company credentials…
      </main>
    );
  }

  return (
    <>
      <UserNav
        currentPage="company"
        onNavigate={handleNavigate}
        isCompany={true}
        onLogout={handleLogout}
      />

      <div className="pt-16">
        <CompanyPortal />
      </div>
    </>
  );
}
