"use client";

import { CVBuilder } from "@/src/components/figma/CVBuilder";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";
import {router} from "next/client";
import {useSearchParams} from "next/navigation";

export default function EditResumePage() {
      const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";

  return (
    <>
      <PublicUserNav />

      <main className="pt-16">
        <CVBuilder
        templateId={templateId}
        onBack={() => router.push("/templates/all")}
        />
      </main>
    </>
  );
}