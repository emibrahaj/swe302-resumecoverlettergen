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
import {ScrollFadeIn} from "@/src/components/figma/ScrollFadeIn";



export default function HomePage() {

    const router = useRouter();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode] = useState<"login" | "signup">("login");

    const closeAuth = () => {
        setAuthOpen(false);
    };

    return (
        <>
            <AuthAwareNav currentPage="landing" />

            <ScrollFadeIn distance={16} duration={0.65}>
                <Hero
                    onGetStarted={() =>
                        router.push("/templates/showcase?from=home")
                    }
                />
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.04}>
                <Features id="features" />
            </ScrollFadeIn>

            <ScrollFadeIn direction="right" delay={0.04}>
                <HowItWorks id="how-it-works" />
            </ScrollFadeIn>

            <ScrollFadeIn distance={42}>
                <TemplateShowcase
                    onViewAll={() => router.push("/templates/all")}
                    onSelectTemplate={(template_key) =>
                        router.push(`/create/resume?template=${template_key}`)
                    }
                />
            </ScrollFadeIn>

            <ScrollFadeIn direction="left" delay={0.04}>
                <ForCompanies
                    onRegisterClick={() => router.push("/company/login")}
                />
            </ScrollFadeIn>

            <ScrollFadeIn distance={28}>
                <Reviews />
            </ScrollFadeIn>
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
