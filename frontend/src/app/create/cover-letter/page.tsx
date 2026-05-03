//TODO add create cover letter button in homepage
"use client";

import {useRouter} from "next/navigation";
import {CoverLetterBuilder} from "@/src/components/figma/CoverLetterBuilder";

export default function CreateCoverLetterPage() {
    const router = useRouter();
    return (
        <CoverLetterBuilder
            onBack={() => router.push("/user/dashboard")}
        />
    )
}