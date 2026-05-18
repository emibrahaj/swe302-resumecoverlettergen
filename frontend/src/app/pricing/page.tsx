"use client";

import {useRouter} from "next/navigation";
import {AuthAwareNav} from "@/src/components/figma/AuthAwareNav";
import {Pricing} from "@/src/components/figma/Pricing";
import {Footer} from "@/src/components/figma/Footer";
import {AuthModal} from "@/src/components/figma/AuthModal";
import {useState} from "react";


export default function PricingPage() {
    const router = useRouter();
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    const closeAuth = () => {
        setAuthOpen(false);
    };

    return (
        <>
            <AuthAwareNav currentPage="pricing" />

            <main className="pt-16">
                <Pricing/>
            </main>
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