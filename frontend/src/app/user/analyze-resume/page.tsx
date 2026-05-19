"use client";

import { useRouter } from "next/navigation";
import { ResumeAnalyzer } from "@/src/components/figma/ResumeAnalyzer";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import {Footer} from "@/src/components/figma/Footer";

export default function ResumeAnalyzerPage() {
  const router = useRouter();

  return (
    <>
      <AuthAwareNav currentPage="dashboard" />
      <main className="pt-16">
        <ResumeAnalyzer
          onBack={() => router.push("/user/dashboard")}
          onUpgrade={() => router.push("/pricing?from=dashboard")}
        />
      </main>
        <Footer />
    </>
  );
}