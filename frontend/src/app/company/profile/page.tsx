"use client";

import {useRouter} from "next/navigation";
import {CompanyProfile} from "@/src/components/figma/CompanyProfile";

export default function CompanyProfilePage() {
    const router = useRouter();
    return (
        <CompanyProfile
            onBack={() => router.push("/company/portal")}
        />
    )
}