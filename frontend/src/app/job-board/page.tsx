"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { JobBoard } from "@/src/components/figma/JobBoard";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";

export default function JobBoardPage() {
  const router = useRouter();

  return (
    <>
      <AuthAwareNav currentPage="job-board" publicCurrentPage="job-board" onBack={() => router.back()} />
      <main className="pt-16">
        <JobBoard onUpgrade={() => router.push("/pricing?from=job-board")} />
      </main>
    </>
  );
}