"use client";

import {useRouter} from "next/navigation";
import {CompanyAuth} from "@/src/components/figma/CompanyAuth";
import {
    AnimatedTemplateBackground
} from "@/src/components/figma/AnimatedTemplateBackground";
import {AuthAwareNav} from "@/src/components/figma/AuthAwareNav";
import {Footer} from "@/src/components/figma/Footer";

export default function CompanyLoginPage() {
    const router = useRouter();

    return (<>
        <AuthAwareNav
            currentPage="company"
        />
        <main className="relative min-h-screen overflow-hidden pt-24">

            <div className="absolute inset-0 z-0 pointer-events-none">
                <AnimatedTemplateBackground/>
            </div>

            <div
                className="absolute inset-0 z-[1] bg-white/10 pointer-events-none"/>

            <div className="relative z-10">
                <CompanyAuth
                    onComplete={() => router.push("/company/portal")}
                    onForgotPassword={() => router.push("/company/forgot-password")}
                />
            </div>

        </main>
        <Footer/>
    </>);
}