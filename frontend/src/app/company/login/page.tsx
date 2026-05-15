"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CompanyAuth } from "@/src/components/figma/CompanyAuth";
import { AnimatedTemplateBackground } from "@/src/components/figma/AnimatedTemplateBackground";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { Footer } from "@/src/components/figma/Footer";
import { useAuth } from "@/src/hooks/useAuth";

export default function CompanyLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isCompany } = useAuth();

  // If a company is already signed in, send them to the portal.
  // If a regular user is signed in, prompt them to log out first.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (isCompany) {
      router.replace("/company/portal");
    } else {
      toast.info("You're signed in as a job seeker. Log out first to access the company portal.");
    }
  }, [isAuthenticated, isCompany, isLoading, router]);

  return (
    <>
      <AuthAwareNav currentPage="company" />
      <main className="relative min-h-screen overflow-hidden pt-24">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatedTemplateBackground />
        </div>

        <div className="absolute inset-0 z-[1] bg-white/10 pointer-events-none" />

        <div className="relative z-10">
          <CompanyAuth
            onComplete={() => router.push("/company/portal")}
            onForgotPassword={() => router.push("/company/forgot-password")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
