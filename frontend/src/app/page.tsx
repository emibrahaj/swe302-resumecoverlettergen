"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import {Navbar} from "../components/figma/Navbar";
import {AuthAwareNav} from "../components/figma/AuthAwareNav";
import {Hero} from "../components/figma/Hero";
import {Features} from "../components/figma/Features";
import {HowItWorks} from "../components/figma/HowItWorks";
import {ForCompanies} from "../components/figma/ForCompanies";
import {Reviews} from "../components/figma/Reviews";
import {Footer} from "../components/figma/Footer";
import {AuthModal} from "../components/figma/AuthModal";
import {TemplateGallery} from "../components/figma/TemplateGallery";
import {TemplateShowcase} from "@/src/components/figma/TemplateShowcase";


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
            <AuthAwareNav
                currentPage="landing"
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                onCoverLetterClick={() => router.push("/create/cover-letter")}
                onPricingClick={() => router.push("/pricing")}
                onCompanyClick={() => {
                    document.getElementById("for-companies")?.scrollIntoView({ behavior: "smooth" });
                }}
                onJobsClick={() => router.push("/job-board?from=home")}
                onCoursesClick={() => router.push("/courses?from=home")}
            />

            <Hero onGetStarted={() => router.push("/templates/showcase?from=home")}/>

            <Features/>
            <HowItWorks/>
            <TemplateShowcase
                onViewAll={() => router.push("/templates/all")}
                onSelectTemplate={(id) =>
                router.push(`/create/resume?template=${id}`)
                 }
            />
            <ForCompanies onRegisterClick={() => router.push("/company/login")}/>
            <Reviews/>
            <Footer/>

            <AuthModal
                isOpen={authOpen}
                onClose={closeAuth}
                initialMode={authMode}
                onComplete={() => router.push("/user/dashboard")}
                onForgotPassword={() => {
                    closeAuth();
                    router.push("/user/forgot-password");
                }}
            />
        </>
    );
}