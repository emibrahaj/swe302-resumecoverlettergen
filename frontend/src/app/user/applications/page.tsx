"use client";

import { useRouter } from "next/navigation";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { JobApplicationTracker } from "@/src/components/figma/JobApplicationTracker";
import {Footer} from "@/src/components/figma/Footer";

export default function ResumeAnalyzerPage() {
  const router = useRouter();

  return (
    <>
      <AuthAwareNav currentPage="dashboard" />
      <main className="pt-16">
        <JobApplicationTracker
            onBack={() => router.push("/user/matched-jobs")}
        />
      </main>
        <Footer />
    </>
  );
}