"use client";

import { CoverLetterBuilder } from "@/src/components/figma/CoverLetterBuilder";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";

export default function CreateCoverLetterPage() {
  return (
    <>
      <PublicUserNav />

      <main className="pt-16">
        <CoverLetterBuilder />
      </main>
    </>
  );
}