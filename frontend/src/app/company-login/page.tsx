"use client";

import {useRouter} from "next/navigation";
import {CompanyAuth} from "../../components/figma/CompanyAuth";

export default function CompanyLoginPage() {
    const router = useRouter();
    return (
        <CompanyAuth
            onBack={() => router.push("/")}
            onComplete={() => router.push("/company-portal")}
        />
    )
}