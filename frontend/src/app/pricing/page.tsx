"use client";

import {useRouter} from "next/navigation";
//import {Pricing} from "../../components/figma/Pricing"; this is also from figma idk
import {SubscriptionPlans} from "../../components/figma/SubscriptionPlans";

export default function PricingPage() {
    const router = useRouter();
    return (
        <SubscriptionPlans
            onBack={() => router.push("/")}
            onSelectPlan={() => router.push("/payment")}
        />
    )
}