"use client";

import {useRouter} from "next/navigation";
import {CompanyProfile} from "../../../components/figma/CompanyProfile";

export default function CompanyProfilePage() {
    const router = useRouter();
    return (
        <CompanyProfile
            onBack={() => router.push("/company/portal")}
        />
    )
}