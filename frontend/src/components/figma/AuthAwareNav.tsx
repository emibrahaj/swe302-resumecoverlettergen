"use client";

import { useRouter } from "next/navigation";
import { useAuth, clearAuthTokens } from "@/src/hooks/useAuth";
import { UserNav, UserNavPage } from "./UserNav";
import { PublicUserNav } from "./PublicUserNav";
import { Navbar } from "./Navbar";

interface AuthAwareNavProps {
  currentPage?: UserNavPage;
  publicCurrentPage?: "templates" | "courses" | "pricing" | "job-board";
  onBack?: () => void;
  // Homepage-specific props passed through to Navbar when not authenticated
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onCoverLetterClick?: () => void;
  onPricingClick?: () => void;
  onCompanyClick?: () => void;
  onJobsClick?: () => void;
  onCoursesClick?: () => void;
}

export function AuthAwareNav({
  currentPage,
  publicCurrentPage,
  onBack,
  onLoginClick,
  onSignupClick,
  onCoverLetterClick,
  onPricingClick,
  onCompanyClick,
  onJobsClick,
  onCoursesClick,
}: AuthAwareNavProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isCompany } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    const isPro = typeof window !== "undefined" && localStorage.getItem("plan") === "pro";

    const handleNavigate = (page: UserNavPage) => {
      switch (page) {
        case "landing": router.push("/"); break;
        case "dashboard": router.push("/user/dashboard"); break;
        case "templates": router.push("/templates/showcase?from=dashboard"); break;
        case "courses": router.push("/courses?from=dashboard"); break;
        case "job-board": router.push("/job-board?from=dashboard"); break;
        case "user-profile": router.push("/user/profile"); break;
        case "company-profile": router.push("/company/profile"); break;
        case "company": router.push("/company/portal"); break;
      }
    };

    const handleLogout = () => {
      clearAuthTokens();
      router.push("/");
    };

    return (
      <UserNav
        currentPage={currentPage ?? ""}
        onNavigate={handleNavigate}
        isCompany={isCompany}
        onLogout={handleLogout}
        isPro={isPro}
      />
    );
  }

  // Not authenticated — if homepage props provided, render full Navbar
  if (onLoginClick && onSignupClick) {
    return (
      <Navbar
        onCoverLetterClick={onCoverLetterClick ?? (() => {})}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onPricingClick={onPricingClick ?? (() => {})}
        onCompanyClick={onCompanyClick ?? (() => {})}
        onJobsClick={onJobsClick ?? (() => {})}
        onCoursesClick={onCoursesClick ?? (() => {})}
      />
    );
  }

  return <PublicUserNav currentPage={publicCurrentPage} onBack={onBack} />;
}