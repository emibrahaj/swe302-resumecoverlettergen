"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { JobBoard } from "@/src/components/figma/JobBoard";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";

export default function JobBoardPage() {
  const router = useRouter();

  // temporary dev state
  const [isPro, setIsPro] = useState(false);

  return (
    <>
      <AuthAwareNav
        currentPage="job-board"
        publicCurrentPage="job-board"
        onBack={() => router.back()}
      />

      <main className="pt-16">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-end">
            <button
              type="button"
              onClick={() => setIsPro((prev) => !prev)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                isPro
                  ? "border-yellow-400 text-yellow-600 bg-yellow-50"
                  : "border-gray-300 text-gray-500 hover:border-[#088395] hover:text-[#088395]"
              }`}
            >
              {isPro ? "Switch to Free" : "Switch to Pro"}
            </button>
          </div>
        </div>

        <JobBoard
          isPro={isPro}
          onUpgrade={() => router.push("/pricing?from=job-board")}
        />
      </main>
    </>
  );
}