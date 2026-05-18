"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {TemplatesShowcase} from "@/src/components/figma/TemplatesShowcase";
import {AuthAwareNav} from "@/src/components/figma/AuthAwareNav";
import {Footer} from "@/src/components/figma/Footer";

export default function AllTemplatesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get("from");
    const isFromDashboard = from === "dashboard";

    return (<>
            <AuthAwareNav currentPage="templates"/>

            <main className="pt-16">
                <TemplatesShowcase
                    onSelectTemplate={(template_key: string) => router.push(`/create/resume?template=${template_key}${isFromDashboard ? "&from=dashboard" : ""}`)}
                />
            </main>
            <Footer/>
        </>);
}