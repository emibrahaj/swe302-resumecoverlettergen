"use client";

import {useRouter, useSearchParams} from "next/navigation";
//import {Pricing} from "../../components/figma/Pricing"; this is also in figma idk
import {SubscriptionPlans} from "../../components/figma/SubscriptionPlans";

export default function PricingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    let backTarget = "/";
    if (from === "dashboard")
        backTarget = "/user/dashboard";
    else if (from === "job-board")
        backTarget = "/job-board";
    else
        backTarget = "/";
    return (
        <SubscriptionPlans
            onBack={() => router.push(backTarget)}
            onSelectPlan={() => router.push("/payment")}
        />
    )
}