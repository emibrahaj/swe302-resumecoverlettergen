"use client";

import { useRouter } from "next/navigation";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { MatchedJobBoard} from "@/src/components/figma/MatchedJobBoard";
import {Footer} from "@/src/components/figma/Footer";

export default function MatchedJobsPage() {
  const router = useRouter();

  return (
    <>
      <AuthAwareNav currentPage="dashboard" />
      <main className="pt-16">
        <MatchedJobBoard
        onBack={() => router.push("/user/dashboard")
        }
        />
      </main>
        <Footer />
    </>
  );
}