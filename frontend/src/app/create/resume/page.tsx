"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CVBuilder } from "../../../components/figma/CVBuilder";

export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";

  return (
    <CVBuilder
      templateId={templateId}
      onBack={() => router.push("/templates/all")}
    />
  );
}