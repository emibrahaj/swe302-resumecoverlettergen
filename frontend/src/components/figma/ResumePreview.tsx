"use client";

import React, { useEffect, useRef, useState } from "react";

import template3 from "@/src/components/resume-templates/template3";
import template4 from "@/src/components/resume-templates/template4";
import template5 from "@/src/components/resume-templates/template5";
import template6 from "@/src/components/resume-templates/template6";
import template7 from "@/src/components/resume-templates/template7";
import template8 from "@/src/components/resume-templates/template8";
import template9 from "@/src/components/resume-templates/template9";
import template10 from "@/src/components/resume-templates/template10";
import template11 from "@/src/components/resume-templates/template11";
import template12 from "@/src/components/resume-templates/template12";

export interface CVData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        title: string;
        summary: string;
        website?: string;
        github?: string;
        linkedin?: string;
    };

    cvPhoto: string | null;

    workExperience: {
        id: string;
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];

    education: {
        id: string;
        degree: string;
        school: string;
        year: string;
    }[];

    skills: string[];

    projects: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];

    customSections: {
        id: string;
        title: string;
        items: string[];
    }[];

    sectionOrder: string[];

    accentColor: string;
    fontFamily: string;

    onlineLinks?: {
        id: string;
        platform: string;
        url: string;
    }[];

    technicalSkills?: {
        name: string;
        category: string;
        level: string;
        proficiency: string;
        items: string[];
        rating: number;
    }[];

    languages?: {
        id: string;
        language_name: string;
        proficiency: string;
    }[];

    certifications?: {
        id: string;
        certification_name: string;
        date_obtained: string;
        issuer: string;
    }[];
}

const TEMPLATE_MAP: Record<
    string,
    React.ComponentType<{
        resumeData: any;
        styleConfig?: any;
    }>
> = {
    template11: template11,
    template12: template12,
    template3: template3,
    template4: template4,
    template5: template5,
    template6: template6,
    template7: template7,
    template8: template8,
    template9: template9,
    template10: template10,

    // slug fallbacks
    modern_minimal: template11,
    professional_classic: template12,
    creative_bold: template3,
    executive_elite: template4,
    tech_innovator: template5,
    designer_portfolio: template6,
    academic_scholar: template7,
    startup_founder: template8,
    minimalist_pro: template9,
    bold_statement: template10,
    simple_pink: template10,
};

/**
 * Find custom section by title — case-insensitive, trim-safe.
 * Also accepts common alternate spellings (e.g. "Certification" → "Certifications").
 */
function getCustomSection(
    sections: CVData["customSections"],
    title: string
) {
    const needle = title.trim().toLowerCase();
    return (
        sections.find((s) => {
            const hay = s.title.trim().toLowerCase();
            return hay === needle || hay === needle.replace(/s$/, "") || hay === needle + "s";
        })?.items || []
    );
}

/**
 * Transform builder data into template-friendly structure
 */
function toResumeData(d: CVData) {
    return {
        personalInfo: {
            fullName: d.personalInfo.fullName,
            jobTitle: d.personalInfo.title,
            email: d.personalInfo.email,
            phone: d.personalInfo.phone,
            location: d.personalInfo.location,
            photoUrl: d.cvPhoto ?? undefined,
            website: d.personalInfo.website || undefined,
github: d.personalInfo.github || undefined,
linkedin: d.personalInfo.linkedin || undefined,
        },

        summary: d.personalInfo.summary,

        experience: d.workExperience.map((e) => ({
            company: e.company,
            position: e.title,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,

            bullets: e.description
                ? e.description
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
        })),

        education: d.education.map((e) => ({
            school: e.school,
            degree: e.degree,
            location: "",
            startDate: "",
            endDate: e.year,
            description: "",
        })),

        skills: [
            {
                category: "Skills",
                level: "",
                items: d.skills,
            },
        ],

        projects: d.projects.map((p) => ({
            title: p.name,
            role: "",
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate,
        })),


        /*
          CUSTOM CATEGORIES
        */

        profiles: (d.onlineLinks ?? []).map((l) => ({
            id: l.id,
            platform: l.platform,
            url: l.url,
        })),

        // Languages: prefer the structured form array (language_name/proficiency)
        // and only fall back to a "Languages" custom section for legacy resumes.
        // Templates check several field aliases (name/language, level/proficiency),
        // so emit all of them at once.
        languages: (d.languages && d.languages.length > 0)
            ? d.languages.map((l) => ({
                id: l.id,
                name: l.language_name,
                language: l.language_name,
                language_name: l.language_name,
                level: l.proficiency,
                proficiency: l.proficiency,
            }))
            : getCustomSection(d.customSections, "Languages").map((item: string) => ({
                name: item,
                language: item,
                language_name: item,
                level: "",
                proficiency: "",
            })),

        hobbies: getCustomSection(
            d.customSections,
            "Hobbies"
        ),

        courses: getCustomSection(
            d.customSections,
            "Courses"
        ).map((item: string) => ({
            title: item,
        })),

        // Certifications: same pattern — pass the form's structured entries with
        // every alias the templates look for, then fall back to a "Certifications"
        // custom section so older resumes keep rendering.
        certifications: (d.certifications && d.certifications.length > 0)
            ? d.certifications.map((c) => ({
                id: c.id,
                title: c.certification_name,
                name: c.certification_name,
                certification_name: c.certification_name,
                issuer: c.issuer,
                provider: c.issuer,
                organization: c.issuer,
                company_name: c.issuer,
                date: c.date_obtained,
                date_obtained: c.date_obtained,
                year: c.date_obtained,
            }))
            : getCustomSection(d.customSections, "Certifications").map((item: string) => ({
                title: item,
                name: item,
                certification_name: item,
            })),

        conferences: getCustomSection(
            d.customSections,
            "Conferences"
        ).map((item: string) => ({
            title: item,
        })),

        other: getCustomSection(
            d.customSections,
            "Other"
        ),

        /*
          Keep raw custom sections too for future dynamic templates.
          extraSections strips out the titles already promoted to dedicated
          categories above (languages/certifications/courses/etc.) so a template
          can render anything left over (e.g. "Training") with a single map.
        */

        customSections: d.customSections,
        extraSections: (d.customSections || []).filter((s) => {
            const t = s.title.trim().toLowerCase();
            const consumed = new Set([
                "languages",
                "language",
                "certifications",
                "certification",
                "courses",
                "course",
                "hobbies",
                "hobby",
                "conferences",
                "conference",
                "other",
            ]);
            return !consumed.has(t) && Array.isArray(s.items) && s.items.some((i) => (i || "").trim() !== "");
        }),
    };
}

export function ResumePreview({
                                  templateId,
                                  data,
                              }: {
    templateId: string;
    data: CVData;
}) {
    const Template =
        TEMPLATE_MAP[templateId] ?? template5;

    const resumeData = toResumeData(data);

    const primaryColor = data.accentColor || "#088395";
    const fontFamily = data.fontFamily || "Inter, sans-serif";

    const styleConfig = {
        primaryColor,
        fontFamily,
    };

    // Templates 3/5/6/7 theme themselves off the `--rp` (resume primary colour)
    // and `--rf` (resume font) CSS variables; templates 4/9/12 read styleConfig
    // directly. A wrapper that defines those variables (plus fontFamily for
    // inheritance) keeps colour + font changes live across every template from a
    // single place — the variables had been dropped in a refactor, which is why
    // customization stopped updating the preview.
    return (
        <div
            // data-no-translate: keep the global DOM translation layer from
            // mutating the resume. The resume must render identically in the editor
            // preview and the headless PDF render target — otherwise their default
            // languages diverge and the PDF headings come out in a different language
            // than the preview.
            data-no-translate=""
            style={
                {
                    "--rp": primaryColor,
                    "--rf": fontFamily,
                    fontFamily,
                } as React.CSSProperties
            }
        >
            <Template
                resumeData={resumeData}
                styleConfig={styleConfig}
            />
        </div>
    );
}
// A4 portrait width at 96dpi — matches the Playwright PDF render and ResumePage.
const A4_WIDTH = 794;

/**
 * Fixed-size dashboard thumbnail. Renders the resume at its true A4 width and
 * scales it down to the card width, clipped to a single A4 page. This keeps every
 * card uniform — multi-page CVs no longer stretch the card vertically and break
 * the grid. (Previously this was just an alias to ResumePreview with no scaling,
 * so a 3-page CV produced a ~3400px-tall card.)
 */
export function ScaledPreview({
    templateId,
    data,
}: {
    templateId: string;
    data: CVData;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.4);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                if (w > 0) setScale(w / A4_WIDTH);
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden bg-white aspect-[794/1123]"
        >
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{ width: `${A4_WIDTH}px`, transform: `scale(${scale})` }}
            >
                <ResumePreview templateId={templateId} data={data} />
            </div>
        </div>
    );
}