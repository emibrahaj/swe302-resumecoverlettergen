"use client";
import {ForgotPassword} from "@/src/components/figma/ForgotPassword";
import {useRouter} from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    return (
        <ForgotPassword
             isCompany={true}
            onBack={() => router.push("/company/login")}
        />
    )
}