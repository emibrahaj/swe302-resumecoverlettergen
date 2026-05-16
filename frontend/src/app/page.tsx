"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {AuthAwareNav} from "../components/figma/AuthAwareNav";
import {Hero} from "../components/figma/Hero";
import {Features} from "../components/figma/Features";
import {HowItWorks} from "../components/figma/HowItWorks";
import {ForCompanies} from "../components/figma/ForCompanies";
import {Reviews} from "../components/figma/Reviews";
import {Footer} from "../components/figma/Footer";
import {AuthModal} from "../components/figma/AuthModal";
import {TemplateShowcase} from "@/src/components/figma/TemplateShowcase";
import { JobApplicationTracker } from "@/src/components/figma/JobApplicationTracker";



export default function HomePage() {

    const router = useRouter();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    const closeAuth = () => {
        setAuthOpen(false);
    };

    return (
        <>
            <AuthAwareNav currentPage="landing" />

            <Hero
                onGetStarted={() =>
                    router.push("/templates/showcase?from=home")
                }
            />

            <Features id="features" />
            <HowItWorks id="how-it-works" />

            <TemplateShowcase
                onViewAll={() => router.push("/templates/all")}
                onSelectTemplate={(template_key) =>
                    router.push(`/create/resume?template=${template_key}`)
                }
            />

            <ForCompanies
                onRegisterClick={() => router.push("/company/login")}
            />

            <Reviews />
            <Footer />

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