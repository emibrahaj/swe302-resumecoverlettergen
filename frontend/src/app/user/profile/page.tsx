"use client";

import {useRouter} from "next/navigation";
import {UserProfile} from "../../../components/figma/UserProfile";

export default function CompanyProfilePage() {
    const router = useRouter();
    return (
        <UserProfile
            onBack={() => router.push("/company/portal")}
        />
    )
}