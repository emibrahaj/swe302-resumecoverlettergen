"use client";
//TODO add back to home button
import {useRouter} from "next/navigation";
import {Courses} from "../../components/figma/Courses";


export default function CoursesPage() {
    const router = useRouter();
    return (
        <Courses
            onBack={() => router.push("/")}
        />
    )
}

