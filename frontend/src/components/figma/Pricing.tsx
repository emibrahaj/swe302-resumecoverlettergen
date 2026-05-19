"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Check, CheckCircle2, Loader2, Sparkles} from "lucide-react";
import {toast} from "sonner";
import {api, ApiError} from "@/src/lib/api";
import {useModals} from "@/src/context/ModalContext";
import {useSubscription} from "@/src/context/SubscriptionContext";
import {useLanguage} from "@/src/context/LanguageContext";

type PlanId = "weekly" | "monthly" | "6month";

const plans: Array<{
    id: PlanId;
    price: string;
    popular: boolean;
}> = [{
    id: "weekly",
    price: "€3.99",
    popular: true,
}, {
    id: "monthly",
    price: "€11.99",
    popular: false,
}, {
    id: "6month",
    price: "€49.99",
    popular: false,
}];

export function Pricing() {
    const router = useRouter();
    const {openLogin} = useModals();
    const {isPro, planId: activePlanId, status: subStatus} = useSubscription();
    const {t} = useLanguage();
    const [loadingId, setLoadingId] = useState<PlanId | null>(null);

    const handleGetStarted = async (planId: PlanId) => {
        if (typeof window !== "undefined" && !window.localStorage.getItem("access_token")) {
            toast.info("Please sign in to subscribe");
            openLogin();
            return;
        }
        // Already an active Pro subscriber on this exact plan? Don't re-trigger
        // the checkout — just take them to their dashboard.
        if (isPro && subStatus === "active" && activePlanId === planId) {
            toast.info("You're already subscribed to this plan.");
            router.push("/user/dashboard");
            return;
        }
        setLoadingId(planId);
        try {
            const res = await api.post<{subscription_id: string; approve_url: string; already_active?: boolean}>(
                "/payments/create-subscription",
                {plan_id: planId},
            );
            if (res.already_active) {
                toast.info("You're already subscribed to this plan.");
                router.push("/user/dashboard");
                return;
            }
            if (res.approve_url) {
                // approve_url is an absolute URL pointing back at our own /checkout page.
                try {
                    const u = new URL(res.approve_url);
                    if (typeof window !== "undefined" && u.origin === window.location.origin) {
                        router.push(u.pathname + u.search);
                    } else {
                        window.location.assign(res.approve_url);
                    }
                } catch {
                    window.location.assign(res.approve_url);
                }
            } else {
                toast.error("Couldn't start checkout — try again");
            }
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : "Couldn't start checkout");
        } finally {
            setLoadingId(null);
        }
    };

    return (<div
        className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-2">
                    {t.pricingPage.heading}
                </h2>
                <p className="text-foreground/70">
                    {t.pricingPage.subheading}
                </p>
            </div>
            {/* Free + Premium Features */}
            <div className="mb-12">
                <div className="max-w-6xl mx-auto">
                    <div
                        className="flex flex-col md:flex-row gap-12 items-center justify-center text-center">
                        {/* Free */}
                        <div
                            className="md:w-1/2 flex flex-col items-center text-center">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight mb-6">
                                {t.pricingPage.freeHeading}
                            </h1>

                            <ul className="space-y-4">
                                {t.pricingPage.freeFeatures.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-3 justify-center md:justify-start"
                                    >
                                        <Check size={20}
                                               className="text-[#088395]"
                                               strokeWidth={3}/>
                                        <span
                                            className="text-black text-base md:text-lg">
                {feature}
              </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Divider */}
                        <div
                            className="hidden md:block w-px bg-gray-200 h-56"/>

                        {/* Premium */}
                        <div
                            className="md:w-1/2 flex flex-col items-center text-center">
                            <div
                                className="flex items-center gap-2 justify-center md:justify-start mb-6">
                                <Sparkles size={24}
                                          className="text-[#088395]"/>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight">
                                    {t.pricingPage.premiumHeading}
                                </h1>
                            </div>

                            <ul className="space-y-4">
                                {t.pricingPage.premiumFeatures.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-3 justify-center md:justify-start"
                                    >
                                        <Check size={20}
                                               className="text-[#088395]"
                                               strokeWidth={3}/>
                                        <span
                                            className="text-black text-base md:text-lg">
                {feature}
              </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>


            {/* Pricing Cards */}
            <div
                className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan, index) => {
                    const planCopy = t.pricingPage.plans[index];
                    return (<div
                    key={plan.id}
                    className={`relative rounded-2xl p-8 ${plan.popular ? "bg-gradient-to-b from-[#088395] to-teal-600 text-white shadow-2xl scale-105" : "bg-white border-2 border-gray-200"}`}
                >
                    {plan.popular && (<div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-black rounded-full flex items-center gap-1">
                        <Sparkles size={14}/>
                        <span
                            className="text-sm font-semibold">
                    {t.pricingPage.mostPopular}
                  </span>
                    </div>)}

                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">
                            {planCopy.name}
                        </h3>
                        <p
                            className={plan.popular ? "text-white/90" : "text-foreground/70"}
                        >
                            {planCopy.description}
                        </p>
                    </div>

                    <div className="text-center mb-6">
                <span className="text-5xl font-bold">
                  {plan.price}
                </span>
                        <span
                            className="text-lg">{planCopy.period}</span>
                    </div>

                    {(() => {
                        const isCurrent = isPro && subStatus === "active" && activePlanId === plan.id;
                        const isLoading = loadingId === plan.id;
                        return (
                            <button
                                type="button"
                                onClick={() => handleGetStarted(plan.id)}
                                disabled={isLoading || isCurrent}
                                className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg ${
                                    isCurrent
                                        ? "bg-green-100 text-green-700 cursor-default hover:shadow-none"
                                        : plan.popular ? "bg-white text-[#088395]" : "bg-[#088395] text-white"
                                } ${isLoading ? "opacity-75 cursor-wait" : ""}`}
                            >
                                {isLoading && <Loader2 size={16} className="animate-spin"/>}
                                {isCurrent && <CheckCircle2 size={16}/>}
                                {isCurrent ? t.pricingPage.currentPlan : isLoading ? t.pricingPage.starting : planCopy.cta}
                            </button>
                        );
                    })()}
                </div>);
                })}
            </div>

            {/* Footer text */}
            <div className="mt-16 text-center">
                <p className="text-foreground/70">
                    {t.pricingPage.footer}
                </p>
            </div>
        </div>
    </div>);
}
