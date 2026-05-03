"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {JobBoard} from "@/src/components/figma/JobBoard";
import {UserNav} from "@/src/components/figma/UserNav";

export default function JobsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    let backTarget = "/";
    if (from === "dashboard")
        backTarget = "/user/dashboard";
    else
        backTarget = "/";

    const handleNavigate = (
        page: "dashboard" | "templates" | "company" | "landing" | "job-board"
    ) => {
        if (page === "landing") router.push("/");
        if (page === "company") router.push("/company/portal");
        if (page === "job-board") router.push("/job-board");
        if (page === "dashboard") router.push("/user/dashboard");
        if (page === "templates") router.push("/templates/showcase");
    };

    return (
        <>
            <UserNav
                currentPage="job-board"
                onNavigate={handleNavigate}
                isCompany={false}
                onLogout={() => router.push("/")}
            />

            <JobBoard
                onBack={() => router.push(backTarget)}
                onUpgrade={() => router.push("/pricing?from=job-board")}
            />
        </>
    )
}
//TODO no navigation bar, maybe consider adding one