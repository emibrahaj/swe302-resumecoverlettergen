"use client";

import {useRouter} from "next/navigation";
import {UserProfile} from "@/src/components/figma/UserProfile";

export default function CompanyProfilePage() {
    const router = useRouter();
    return (
        <UserProfile
            onBack={() => router.push("/user/dashboard")}
        />
    )
}