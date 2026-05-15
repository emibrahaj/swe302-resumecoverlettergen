"use client";

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
    fullName: string; email: string; phone: string;
    location: string; title: string; summary: string;
  };
  cvPhoto: string | null;
  workExperience: { id: string; title: string; company: string; location: string; startDate: string; endDate: string; description: string; }[];
  education: { id: string; degree: string; school: string; year: string; }[];
  skills: string[];
  projects: { id: string; name: string; startDate: string; endDate: string; description: string; }[];
  customSections: { id: string; title: string; items: string[]; }[];
  sectionOrder: string[];
  accentColor: string;
  fontFamily: string;
}

const TEMPLATE_MAP: Record<string, React.ComponentType<{ resumeData: any; styleConfig?: any }>> = {
  'template11':  template11,
  'template12':  template12,
  'template3':  template3,
  'template4':  template4,
  'template5':  template5,
  'template6':  template6,
  'template7':  template7,
  'template8':  template8,
  'template9':  template9,
  'template10': template10,
  // slug fallbacks (used when style_config.templateKey is absent)
  'modern_minimal':       template11,
  'professional_classic': template12,
  'creative_bold':        template3,
  'executive_elite':      template4,
  'tech_innovator':       template5,
  'designer_portfolio':   template6,
  'academic_scholar':     template7,
  'startup_founder':      template8,
  'minimalist_pro':       template9,
  'bold_statement':       template10,
  'simple_pink':          template10,
};

/** Transform CVBuilder's flat CVData into the shape real templates expect */
function toResumeData(d: CVData) {
  return {
    personalInfo: {
      fullName:  d.personalInfo.fullName,
      jobTitle:  d.personalInfo.title,
      email:     d.personalInfo.email,
      phone:     d.personalInfo.phone,
      location:  d.personalInfo.location,
      photoUrl:  d.cvPhoto ?? undefined,
      website:   undefined,
    },
    summary: d.personalInfo.summary,
    experience: d.workExperience.map(e => ({
      company:   e.company,
      position:  e.title,
      location:  e.location,
      startDate: e.startDate,
      endDate:   e.endDate,
      // templates expect bullets[]; split on newlines if the user typed multi-line
      bullets:   e.description
        ? e.description.split("\n").map(s => s.trim()).filter(Boolean)
        : [],
    })),
    education: d.education.map(e => ({
      school:    e.school,
      degree:    e.degree,
      location:  "",
      startDate: "",
      endDate:   e.year,
      description: "",
    })),
    // templates expect [{ category, level, items }]; wrap the flat skill list
    skills: [
      {
        category: "Skills",
        level:     "",
        items:     d.skills.join(", "),
      },
    ],
    projects:       d.projects,
    certifications: [],
    links:          [],
  };
}
export function ResumePreview({ templateId, data }: { templateId: string; data: CVData }) {
  const Template = TEMPLATE_MAP[templateId] ?? template5;
  const resumeData = toResumeData(data);
  const styleConfig = {
    primaryColor: data.accentColor,
    fontFamily:   data.fontFamily,
  };

  return <Template resumeData={resumeData} styleConfig={styleConfig} />;
}