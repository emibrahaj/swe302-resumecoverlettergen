"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Navbar } from "../components/figma/Navbar";
import { Hero } from "../components/figma/Hero";
import { Features } from "../components/figma/Features";
import { HowItWorks } from "../components/figma/HowItWorks";
import { ForCompanies } from "../components/figma/ForCompanies";
import { Reviews } from "../components/figma/Reviews";
import { Footer } from "../components/figma/Footer";
import { AuthModal } from "../components/figma/AuthModal";

export default function HomePage() {
  const router = useRouter();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openSignup = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
  };

  return (
    <>
      <Navbar
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        onPricingClick={() => router.push("/pricing")}
        onCompanyClick={() => router.push("/company-login")}
        onJobsClick={() => router.push("/jobs")}
        onCoursesClick={() => router.push("/courses")}
      />

      <Hero onGetStarted={() => router.push("/templates")} />

      <Features />
      <HowItWorks />
      <ForCompanies />
      <Reviews />
      <Footer />

      <AuthModal
        isOpen={authOpen}
        onClose={closeAuth}
        initialMode={authMode}
        onComplete={() => {
          console.log("Auth completed");
        }}
      />
    </>
  );
}