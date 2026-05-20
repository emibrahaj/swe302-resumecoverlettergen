"use client";

import {useRouter} from "next/navigation";
import {Crown, Lock} from "lucide-react";
import {Courses} from "@/src/components/figma/Courses";
import {AuthAwareNav} from "@/src/components/figma/AuthAwareNav";
import {Footer} from "@/src/components/figma/Footer";
import {useSubscription} from "@/src/context/SubscriptionContext";

function ProPaywall({onUpgrade, onBack}: { onUpgrade: () => void; onBack: () => void }) {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-10 text-center">
                <div
                    className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-5">
                    <Crown size={28} className="text-white"/>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Courses are a Pro perk
                </h1>
                <p className="text-gray-600 mb-6">
                    Discounted courses from AWS, Educative, Pluralsight and more
                    are available to Pro subscribers only. Upgrade to unlock the
                    full catalog of curated career courses.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        type="button"
                        onClick={onUpgrade}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#088395] to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        <Crown size={16}/>
                        Upgrade to Pro
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                    >
                        <Lock size={16}/>
                        Go back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CoursesPage() {
    const router = useRouter();
    const {isPro, loading} = useSubscription();

    return (
        <>
            <AuthAwareNav currentPage="courses" publicCurrentPage="courses"
                          onBack={() => router.back()}/>
            <main className="pt-16">
                {loading ? (
                    <div
                        className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-gray-500">
                        Checking your subscription…
                    </div>
                ) : isPro ? (
                    <Courses/>
                ) : (
                    <ProPaywall
                        onUpgrade={() => router.push("/pricing?from=courses")}
                        onBack={() => router.back()}
                    />
                )}
            </main>
            <Footer/>
        </>
    );
}