"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CVBuilder } from "../../../components/figma/CVBuilder";

export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";

  return (
    <CVBuilder
        onBack={() => router.push("/templates/select-template")}
      templateId={templateId}
    />
  );
}
//TODO maybe remove the pfp selector from resume builder, it will just use the account pfp directly
//  ergo if you want to use a template with a picture, you must create an account first