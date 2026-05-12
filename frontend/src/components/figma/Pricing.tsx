"use client";
import {Check, Sparkles} from "lucide-react";

const freeFeatures = ["Build polished resumes with AI", "Create" +
" tailored cover letters instantly", "Save and download without limits" +
" for free", "Use ATS-friendly resume templates", "Edit and reuse your" +
" documents anytime",];

const premiumFeatures = ["Unlock advanced resume analysis", "Get personalized job matches", "Discover skill gaps before applying", "Receive course recommendations", "Access deeper market insights", "Get priority support when needed",];

const plans = [{
    name: "Weekly",
    price: "€4.99",
    period: "/week",
    description: "Perfect for getting started",
    cta: "Get Started",
    popular: true,
}, {
    name: "Monthly",
    price: "€11.99",
    period: "/month",
    description: "Best for job seekers",
    cta: "Get Started",
    popular: false,
}, {
    name: "6 Months",
    price: "€49.99",
    period: "/6 months",
    description: "Save more long-term",
    cta: "Get Started",
    popular: false,
},];

export function Pricing() {
    return (<div
        className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-2">
                    Choose Your Plan
                </h2>
                <p className="text-foreground/70">
                    Simple, transparent pricing
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
                                Free features include
                            </h1>

                            <ul className="space-y-4">
                                {freeFeatures.map((feature, index) => (
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
                                    Premium plans include
                                </h1>
                            </div>

                            <ul className="space-y-4">
                                {premiumFeatures.map((feature, index) => (
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
                {plans.map((plan, index) => (<div
                    key={index}
                    className={`relative rounded-2xl p-8 ${plan.popular ? "bg-gradient-to-b from-[#088395] to-teal-600 text-white shadow-2xl scale-105" : "bg-white border-2 border-gray-200"}`}
                >
                    {plan.popular && (<div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-black rounded-full flex items-center gap-1">
                        <Sparkles size={14}/>
                        <span
                            className="text-sm font-semibold">
                    Most Popular
                  </span>
                    </div>)}

                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">
                            {plan.name}
                        </h3>
                        <p
                            className={plan.popular ? "text-white/90" : "text-foreground/70"}
                        >
                            {plan.description}
                        </p>
                    </div>

                    <div className="text-center mb-6">
                <span className="text-5xl font-bold">
                  {plan.price}
                </span>
                        <span
                            className="text-lg">{plan.period}</span>
                    </div>

                    <button
                        className={`w-full py-4 rounded-lg font-semibold transition-all ${plan.popular ? "bg-white text-[#088395]" : "bg-[#088395] text-white"}`}
                    >
                        {plan.cta}
                    </button>
                </div>))}
            </div>

            {/* Footer text */}
            <div className="mt-16 text-center">
                <p className="text-foreground/70">
                    Cancel anytime. No hidden fees.
                </p>
            </div>
        </div>
    </div>);
}