"use client";

import {useRouter} from "next/navigation";
import {ForgotPassword} from "@/src/components/figma/ForgotPassword";
import {AnimatedTemplateBackground} from "@/src/components/figma/AnimatedTemplateBackground";

export default function CompanyForgotPasswordPage() {
    const router = useRouter();

    return (
        <main className="relative min-h-screen overflow-hidden bg-white">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <AnimatedTemplateBackground/>
            </div>

            <div className="absolute inset-0 z-[1] bg-white/20 pointer-events-none"/>

            <div className="relative z-10">
                <ForgotPassword
                    isCompany
                    onBackToLogin={() => router.push("/company/login")}
                />
            </div>
        </main>
    );
}