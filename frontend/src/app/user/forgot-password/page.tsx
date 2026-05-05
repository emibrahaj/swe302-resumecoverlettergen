"use client";

import { ForgotPassword } from "@/src/components/figma/ForgotPassword";
import {AnimatedTemplateBackground} from "@/src/components/figma/AnimatedTemplateBackground";
import {useRouter} from "next/navigation";


export default function UserForgotPasswordPage() {
    const router = useRouter();

    return (
        <main className="relative min-h-screen overflow-hidden bg-white">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <AnimatedTemplateBackground/>
            </div>

            <div className="absolute inset-0 z-[1] bg-white/20 pointer-events-none"/>

            <div className="relative z-10">
                <ForgotPassword
                    onBackToLogin={() => router.push("/")}
                />
            </div>
        </main>
    );
}
