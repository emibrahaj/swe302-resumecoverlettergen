"use client";

import { useRouter } from "next/navigation";
import { useAuth, clearAuthTokens } from "@/src/hooks/useAuth";
import { UserNav, UserNavPage } from "./UserNav";
import { PublicUserNav } from "./PublicUserNav";

interface AuthAwareNavProps {
  /** Active page for the UserNav highlight (only used when authenticated). */
  currentPage?: UserNavPage;
  /**
   * Active page for the PublicUserNav highlight (only used when not
   * authenticated). Subset of pages that exist in the public nav.
   */
  publicCurrentPage?: "templates" | "courses" | "pricing" | "job-board";
  /** Show the back arrow in PublicUserNav when not authenticated. */
  onBack?: () => void;
}

/**
 * Auth-aware navigation bar.
 *
 * - While auth state is loading: renders nothing (avoids flash).
 * - Authenticated  → `UserNav` with routing + logout.
 * - Not authenticated → `PublicUserNav`.
 */
export function AuthAwareNav({
  currentPage,
  publicCurrentPage,
  onBack,
}: AuthAwareNavProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isCompany } = useAuth();

  // Avoid navbar flash on first render while localStorage is being read.
  if (isLoading) return null;

  if (isAuthenticated) {
    const handleNavigate = (page: UserNavPage) => {
      switch (page) {
        case "landing":
          router.push("/");
          break;
        case "dashboard":
          router.push("/user/dashboard");
          break;
        case "templates":
          router.push("/templates/showcase?from=dashboard");
          break;
        case "courses":
          router.push("/courses?from=dashboard");
          break;
        case "job-board":
          router.push("/job-board?from=dashboard");
          break;
        case "user-profile":
          router.push("/user/profile");
          break;
        case "company-profile":
          router.push("/company/profile");
          break;
        case "company":
          router.push("/company/portal");
          break;
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
      />
    );
  }

  return <PublicUserNav currentPage={publicCurrentPage} onBack={onBack} />;
}
