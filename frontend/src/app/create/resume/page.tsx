"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {CVBuilder} from "@/src/components/figma/CVBuilder";
import {PublicUserNav} from "@/src/components/figma/PublicUserNav";

export default function CreateResumePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("template") || "1";

    return (
        <>
            <PublicUserNav/>
            <CVBuilder
                onBack={() => router.push("/templates/select-template")}
                templateId={templateId}
            />
        </>
    );
}
//TODO maybe remove the pfp selector from resume builder, it will just use the account pfp directly
//  ergo if you want to use a template with a picture, you must create an account first

//TODO make it possible to change the ordering of the cv parts