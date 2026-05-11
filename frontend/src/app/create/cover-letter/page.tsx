"use client";

import { CoverLetterBuilder } from "@/src/components/figma/CoverLetterBuilder";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";

export default function EditCoverLetterPage() {
  return (
    <>
      <AuthAwareNav currentPage="dashboard" />

      <main className="pt-16">
        <CoverLetterBuilder />
      </main>
    </>
  );
}
