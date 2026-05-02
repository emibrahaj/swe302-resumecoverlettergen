"use client";

import {useRouter} from "next/navigation";
import {JobBoard} from "../../components/figma/JobBoard";

export default function JobsPage() {
    const router = useRouter();
    return (
        <JobBoard
            onBack={() => router.push("/")}
            onUpgrade={() => router.push("/pricing")}
        />
    )
}