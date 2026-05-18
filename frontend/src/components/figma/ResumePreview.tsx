"use client";

import React, { useRef, useEffect, useState } from "react";

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

    // Used by templates that show extra profile/contact fields
    website?: string;
    github?: string;
    linkedin?: string;
  };

  cvPhoto: string | null;

  onlineLinks?: {
    id: string;
    platform: string;
    url: string;
  }[];

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
    startDate?: string;
    year: string;
  }[];

  /**
   * Keep this as string[] so older templates do not break.
   */
  skills: string[];

  /**
   * Rich skill data used by templates that need category/items/rating.
   */
  technicalSkills?: {
    name: string;
    category: string;
    level: string;
    proficiency: string;
    items: string[];
    rating: number;
  }[];

  projects: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    link?: string;
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

  customSections: {
    id: string;
    title: string;
    items: string[];
  }[];

  sectionOrder: string[];

  accentColor: string;
  fontFamily: string;
}

const TEMPLATE_MAP: Record<
  string,
  React.ComponentType<{
    resumeData: any;
    styleConfig?: any;
  }>
> = {
  template3,
  template4,
  template5,
  template6,
  template7,
  template8,
  template9,
  template10,
  template11,
  template12,

  "template_3.html": template3,
  "template_4.html": template4,
  "template_5.html": template5,
  "template_6.html": template6,
  "template_7.html": template7,
  "template_8.html": template8,
  "template_9.html": template9,
  "template_10.html": template10,
  "template_11.html": template11,
  "template_12.html": template12,

  template_3: template3,
  template_4: template4,
  template_5: template5,
  template_6: template6,
  template_7: template7,
  template_8: template8,
  template_9: template9,
  template_10: template10,
  template_11: template11,
  template_12: template12,

  creative_bold: template3,
  executive_elite: template4,
  tech_innovator: template5,
  designer_portfolio: template6,
  academic_scholar: template7,
  mint_card: template7,
  startup_founder: template8,
  minimalist_pro: template9,
  bold_statement: template10,
  modern_minimal: template11,
  professional_classic: template12,
  corporate_blue: template12,
  simple_pink: template10,
};

function normalizeTemplateId(templateId?: string | null) {
  if (!templateId) return "template5";

  const cleaned = templateId.trim();

  if (TEMPLATE_MAP[cleaned]) {
    return cleaned;
  }

  if (/^template_\d+$/.test(cleaned)) {
    const htmlKey = `${cleaned}.html`;
    return TEMPLATE_MAP[htmlKey] ? htmlKey : "template5";
  }

  const compactMatch = cleaned.match(/^template(\d+)$/);

  if (compactMatch) {
    const directKey = `template${compactMatch[1]}`;
    const htmlKey = `template_${compactMatch[1]}.html`;

    if (TEMPLATE_MAP[directKey]) return directKey;
    if (TEMPLATE_MAP[htmlKey]) return htmlKey;
  }

  const fileName = cleaned.split("/").pop();

  if (fileName && TEMPLATE_MAP[fileName]) {
    return fileName;
  }

  return "template5";
}

function isTemplate3Id(templateId: string) {
  return (
    templateId === "template3" ||
    templateId === "template_3" ||
    templateId === "template_3.html" ||
    templateId === "creative_bold"
  );
}

function isTemplate4Id(templateId: string) {
  return (
    templateId === "template4" ||
    templateId === "template_4" ||
    templateId === "template_4.html" ||
    templateId === "executive_elite"
  );
}

function isTemplate6Id(templateId: string) {
  return (
    templateId === "template6" ||
    templateId === "template_6" ||
    templateId === "template_6.html" ||
    templateId === "designer_portfolio"
  );
}

function isTemplate7Id(templateId: string) {
  return (
    templateId === "template7" ||
    templateId === "template_7" ||
    templateId === "template_7.html" ||
    templateId === "academic_scholar" ||
    templateId === "mint_card"
  );
}

function getCustomSection(sections: CVData["customSections"], title: string) {
  const needle = title.trim().toLowerCase();

  return (
    sections.find((section) => {
      const hay = section.title.trim().toLowerCase();

      return (
        hay === needle ||
        hay === needle.replace(/s$/, "") ||
        hay === `${needle}s`
      );
    })?.items || []
  );
}

function normalizeSkill(skill: string) {
  const cleanSkill = skill.trim();

  if (!cleanSkill) {
    return null;
  }

  if (cleanSkill.includes(":")) {
    const [categoryPart, ...itemParts] = cleanSkill.split(":");

    const category = categoryPart.trim();

    const items = itemParts
      .join(":")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      name: category,
      category,
      level: "Experienced",
      proficiency: "Experienced",
      items,
      rating: 3,
      raw: cleanSkill,
    };
  }

  return {
    name: cleanSkill,
    category: cleanSkill,
    level: "Experienced",
    proficiency: "Experienced",
    items: [],
    rating: 3,
    raw: cleanSkill,
  };
}

function toResumeData(d: CVData, normalizedTemplateId: string) {
  const normalizedSkills = d.skills.map(normalizeSkill).filter(Boolean);

  const richSkills =
    d.technicalSkills && d.technicalSkills.length > 0
      ? d.technicalSkills.map((skill) => ({
          name: skill.name,
          category: skill.category || skill.name,
          level: skill.level || skill.proficiency || "Experienced",
          proficiency: skill.proficiency || skill.level || "Experienced",
          items: Array.isArray(skill.items) ? skill.items : [],
          rating: skill.rating || 3,
          raw:
            Array.isArray(skill.items) && skill.items.length > 0
              ? `${skill.category || skill.name}: ${skill.items.join(", ")}`
              : skill.category || skill.name,
        }))
      : normalizedSkills;

const shouldUseRichSkills =
  isTemplate3Id(normalizedTemplateId) ||
  isTemplate4Id(normalizedTemplateId) ||
  isTemplate6Id(normalizedTemplateId) ||
  isTemplate7Id(normalizedTemplateId);

  const mappedLinks = (d.onlineLinks || [])
    .filter((link) => link.platform.trim() || link.url.trim())
    .map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.platform,
      link: link.url,
    }));

  const customCertificationItems = getCustomSection(
    d.customSections,
    "Certifications"
  ).map((item, index) => ({
    id: `custom-cert-${index}`,
    certification_name: item,
    name: item,
    issuer: "",
    company_name: "",
    date_obtained: "",
    date: "",
    title: item,
  }));

  const realCertifications = (d.certifications || []).map((cert) => ({
    id: cert.id,
    certification_name: cert.certification_name,
    name: cert.certification_name,
    issuer: cert.issuer,
    company_name: cert.issuer,
    date_obtained: cert.date_obtained,
    date: cert.date_obtained,
    title: cert.certification_name,
  }));

  return {
    personalInfo: {
      fullName: d.personalInfo.fullName,
      jobTitle: d.personalInfo.title,
      title: d.personalInfo.title,
      email: d.personalInfo.email,
      phone: d.personalInfo.phone,
      location: d.personalInfo.location,
      photoUrl: d.cvPhoto ?? undefined,

      website: d.personalInfo.website ?? "",
      github: d.personalInfo.github ?? "",
      linkedin: d.personalInfo.linkedin ?? "",
    },

    summary: d.personalInfo.summary,

    experience: d.workExperience.map((experience) => ({
      company: experience.company,
      companyName: experience.company,
      position: experience.title,
      title: experience.title,
      role: experience.title,
      location: experience.location,
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.description,
      bullets: experience.description
        ? experience.description
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        : [],
    })),

    education: d.education.map((education) => ({
      school: education.school,
      university: education.school,
      degree: education.degree,
      location: "",
      startDate: education.startDate ?? "",
      endDate: education.year,
      year: education.year,
      description: "",
    })),

    skills: shouldUseRichSkills ? richSkills : normalizedSkills,

    technicalSkills: d.technicalSkills || richSkills,

    skillList: d.skills.map((skill) => skill.trim()).filter(Boolean),

    projects: d.projects.map((project) => ({
      id: project.id,
      name: project.name,
      title: project.name,
      project_name: project.name,
      role: "",
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      link: project.link ?? "",
    })),

    links: mappedLinks,
    profiles: mappedLinks,

    languages: (d.languages || []).map((language) => ({
      id: language.id,
      language_name: language.language_name,
      name: language.language_name,
      proficiency: language.proficiency,
      level: language.proficiency,
    })),

    hobbies: getCustomSection(d.customSections, "Hobbies"),

    courses: getCustomSection(d.customSections, "Courses").map((item) => ({
      title: item,
    })),

    certifications: [...realCertifications, ...customCertificationItems],

    conferences: getCustomSection(d.customSections, "Conferences").map(
      (item) => ({
        title: item,
      })
    ),

    other: getCustomSection(d.customSections, "Other"),

    customSections: d.customSections,
    sectionOrder: d.sectionOrder,
  };
}

export function ResumePreview({
  templateId,
  data,
}: {
  templateId: string;
  data: CVData;
}) {
  const normalizedTemplateId = normalizeTemplateId(templateId);
  const Template = TEMPLATE_MAP[normalizedTemplateId] ?? template5;

  const resumeData = toResumeData(data, normalizedTemplateId);

  const styleConfig = {
    primaryColor: data.accentColor,
    fontFamily: data.fontFamily,
  };

  return <Template resumeData={resumeData} styleConfig={styleConfig} />;
}

/** Natural A4 pixel dimensions that every template renders at. */
const NATURAL_W = 794;
const NATURAL_H = 1123;

/**
 * Thumbnail wrapper that scales a full ResumePreview down to fill its
 * container exactly, using a ResizeObserver so it stays correct on any
 * screen size or column count.
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

    const update = (width: number) => setScale(width / NATURAL_W);

    // Set immediately so first paint is already correct.
    update(el.getBoundingClientRect().width);

    const obs = new ResizeObserver(([entry]) =>
      update(entry.contentRect.width)
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-white"
      style={{ height: Math.round(NATURAL_H * scale) }}
    >
      <div
        style={{
          width: NATURAL_W,
          height: NATURAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        <ResumePreview templateId={templateId} data={data} />
      </div>
    </div>
  );
}