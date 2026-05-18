"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CoverLetterBuilder } from "@/src/components/figma/CoverLetterBuilder";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";

function EditCoverLetterInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;

  return <CoverLetterBuilder initialId={id} />;
}

export default function EditCoverLetterPage() {
  return (
    <>
      <AuthAwareNav currentPage="dashboard" />
      <main className="pt-16">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-foreground/60">Loading…</div>}>
          <EditCoverLetterInner />
        </Suspense>
      </main>
    </>
  );
}