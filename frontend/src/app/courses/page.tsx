"use client";

import {useRouter} from "next/navigation";
import {Courses} from "@/src/components/figma/Courses";
import {AuthAwareNav} from "@/src/components/figma/AuthAwareNav";
import {Footer} from "@/src/components/figma/Footer";

export default function CoursesPage() {
    const router = useRouter();

    return (
        <>
            <AuthAwareNav currentPage="courses" publicCurrentPage="courses"
                          onBack={() => router.back()}/>
            <main className="pt-16">
                <Courses/>
            </main>
            <Footer/>
        </>
    );
}