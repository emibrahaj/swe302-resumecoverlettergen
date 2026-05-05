"use client";

import {useRouter} from "next/navigation";
import {UserProfile} from "@/src/components/figma/UserProfile";
import {AnimatedTemplateBackground} from "@/src/components/figma/AnimatedTemplateBackground";

export default function CompanyProfilePage() {
    const router = useRouter();
    return (<main className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <AnimatedTemplateBackground/>
            </div>
            <div className="absolute inset-0 z-[1] bg-white/10 pointer-events-none"/>


            <div className="relative z-10">
                <UserProfile
                    onBack={() => router.push("/user/dashboard")}
                />
            </div>
        </main>)
}