"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CompanyProfile } from "@/src/components/figma/CompanyProfile";
import { useAuth } from "@/src/hooks/useAuth";

export default function CompanyProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isCompany } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      toast.info("Please log in to your company account.");
      router.replace("/company/login");
      return;
    }
    if (!isCompany) {
      toast.error("Company profile is for company accounts only.");
      router.replace("/user/dashboard");
    }
  }, [isAuthenticated, isCompany, isLoading, router]);

  if (isLoading || !isAuthenticated || !isCompany) {
    return (
      <main className="min-h-screen flex items-center justify-center text-foreground/60">
        Checking your company credentials…
      </main>
    );
  }

  return <CompanyProfile onBack={() => router.push("/company/portal")} />;
}
