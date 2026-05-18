"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const hasText = (value: any) => {
  return typeof value === "string" && value.trim() !== "";
};

const hasAnyText = (...values: any[]) => {
  return values.some((value) => hasText(value));
};

const normalizeSkillItems = (items: any) => {
  if (Array.isArray(items)) {
    return items
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  if (hasText(items)) {
    return String(items)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const Template7: React.FC<Props> = ({ resumeData }) => {
  const {
    personalInfo = {},
    summary = "",
    skills = [],
    experience = [],
    links = [],
    projects = [],
    languages = [],
    certifications = [],
    customSections = [],
  } = resumeData || {};

  const showHeader =
    hasText(personalInfo.fullName) ||
    hasText(personalInfo.jobTitle) ||
    hasText(personalInfo.title) ||
    hasText(personalInfo.email) ||
    hasText(personalInfo.phone) ||
    hasText(personalInfo.location) ||
    hasText(personalInfo.website) ||
    hasText(personalInfo.photoUrl);

  const filledLinks = Array.isArray(links)
    ? links.filter((link: any) => hasAnyText(link?.platform, link?.url))
    : [];

  const filledSkills = Array.isArray(skills)
    ? skills.filter((skill: any) => {
        if (typeof skill === "string") return hasText(skill);

        const items = normalizeSkillItems(skill?.items);

        return (
          hasAnyText(
            skill?.category,
            skill?.name,
            skill?.level,
            skill?.proficiency
          ) ||
          items.length > 0 ||
          Number(skill?.rating) > 0
        );
      })
    : [];

  const filledExperience = Array.isArray(experience)
    ? experience.filter((exp: any) => {
        const hasBullets =
          Array.isArray(exp?.bullets) &&
          exp.bullets.some((bullet: string) => hasText(bullet));

        return (
          hasAnyText(
            exp?.company,
            exp?.companyName,
            exp?.position,
            exp?.title,
            exp?.role,
            exp?.location,
            exp?.startDate,
            exp?.endDate,
            exp?.description
          ) || hasBullets
        );
      })
    : [];

  const filledProjects = Array.isArray(projects)
    ? projects.filter((project: any) =>
        hasAnyText(
          project?.name,
          project?.title,
          project?.project_name,
          project?.startDate,
          project?.endDate,
          project?.description,
          project?.link
        )
      )
    : [];

  const filledLanguages = Array.isArray(languages)
    ? languages.filter((language: any) =>
        hasAnyText(
          language?.language_name,
          language?.name,
          language?.proficiency,
          language?.level
        )
      )
    : [];

  const filledCertifications = Array.isArray(certifications)
    ? certifications.filter((cert: any) =>
        hasAnyText(
          cert?.certification_name,
          cert?.name,
          cert?.issuer,
          cert?.company_name,
          cert?.date_obtained,
          cert?.date
        )
      )
    : [];

  const filledCustomSections = Array.isArray(customSections)
    ? customSections.filter((section: any) => {
        const items = Array.isArray(section?.items)
          ? section.items.filter((item: any) => {
              if (typeof item === "string") return hasText(item);

              if (typeof item === "object" && item !== null) {
                return Object.values(item).some((value: any) =>
                  hasText(String(value || ""))
                );
              }

              return false;
            })
          : [];

        return hasText(section?.title) && items.length > 0;
      })
    : [];

  const showLinks = filledLinks.length > 0;
  const showSummary = hasText(summary);
  const showSkills = filledSkills.length > 0;
  const showExperience = filledExperience.length > 0;
  const showProjects = filledProjects.length > 0;
  const showLanguages = filledLanguages.length > 0;
  const showCertifications = filledCertifications.length > 0;

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "onlinePresence",
          "summary",
          "skills",
          "experience",
          "projects",
          "languages",
          "certifications",
          ...filledCustomSections.map((section: any) => section.id),
        ];

  const sectionClass = "mt-5 border-b border-gray-400 pb-4";
  const lastSectionClass = "mt-5";
  const headingClass = "text-[16px] font-bold mb-3";
  const itemTitleClass = "text-[13px] font-bold";
  const itemSubClass = "text-[11px] mt-1";
  const bodyTextClass = "text-[10px] mt-2 leading-4";

  const renderOnlinePresence = () => {
    if (!showLinks) return null;

    return (
      <section key="onlinePresence" className={sectionClass}>
        <h2 className={headingClass}>Online Presence</h2>

        <div className="grid grid-cols-3 gap-4">
          {filledLinks.map((link: any, index: number) => (
            <div key={index}>
              {hasText(link.platform) && (
                <h3 className="font-semibold text-[11px]">
                  {link.platform}
                </h3>
              )}

              {hasText(link.url) && (
                <p className="mt-1 text-[10px] break-words">
                  {link.url}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSummary = () => {
    if (!showSummary) return null;

    return (
      <section key="summary" className={sectionClass}>
        <h2 className={headingClass}>Professional Summary</h2>

        <p className="text-[11px] leading-5">{summary}</p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!showSkills) return null;

    return (
      <section key="skills" className={sectionClass}>
        <h2 className="text-[16px] font-bold mb-4">Technical Skills</h2>

        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          {filledSkills.map((skill: any, index: number) => {
            const skillObj =
              typeof skill === "string"
                ? {
                    name: skill,
                    category: skill,
                    level: "",
                    proficiency: "",
                    items: [],
                    rating: 0,
                  }
                : skill;

            const title = hasText(skillObj.category)
              ? skillObj.category
              : hasText(skillObj.name)
                ? skillObj.name
                : "";

            const level = hasText(skillObj.level)
              ? skillObj.level
              : hasText(skillObj.proficiency)
                ? skillObj.proficiency
                : "";

            const items = normalizeSkillItems(skillObj.items);

            return (
              <div key={index}>
                {hasText(title) && (
                  <h3 className="text-[12px] font-bold">{title}</h3>
                )}

                {hasText(level) && (
                  <p className="mt-1 text-[11px]">{level}</p>
                )}

                {items.length > 0 && (
                  <p className="mt-1 text-[10px] leading-4">
                    {items.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!showExperience) return null;

    return (
      <section key="experience" className={lastSectionClass}>
        <h2 className="text-[16px] font-bold mb-4">
          Professional Experience
        </h2>

        <div className="space-y-5">
          {filledExperience.map((exp: any, index: number) => {
            const company = exp.company || exp.companyName || "";
            const position = exp.position || exp.title || exp.role || "";

            const bullets = Array.isArray(exp.bullets)
              ? exp.bullets.filter((bullet: string) => hasText(bullet))
              : hasText(exp.description)
                ? [exp.description]
                : [];

            return (
              <div key={index}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {hasText(company) && (
                      <h3 className={itemTitleClass}>{company}</h3>
                    )}

                    {hasText(position) && (
                      <p className={itemSubClass}>{position}</p>
                    )}
                  </div>

                  {(hasText(exp.location) ||
                    hasText(exp.startDate) ||
                    hasText(exp.endDate)) && (
                    <div className="text-right text-[10px] shrink-0">
                      {hasText(exp.location) && <p>{exp.location}</p>}

                      {(hasText(exp.startDate) || hasText(exp.endDate)) && (
                        <p>
                          {hasText(exp.startDate) ? exp.startDate : ""}
                          {hasText(exp.startDate) && hasText(exp.endDate)
                            ? " - "
                            : ""}
                          {hasText(exp.endDate) ? exp.endDate : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {bullets.length > 0 && (
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-[10px] leading-4">
                    {bullets.map((bullet: string, i: number) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!showProjects) return null;

    return (
      <section key="projects" className={sectionClass}>
        <h2 className={headingClass}>Projects</h2>

        <div className="space-y-4">
          {filledProjects.map((project: any, index: number) => {
            const projectName =
              project.name || project.title || project.project_name || "";

            return (
              <div key={index}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {hasText(projectName) && (
                      <h3 className={itemTitleClass}>{projectName}</h3>
                    )}

                    {hasText(project.link) && (
                      <p className="mt-1 text-[10px] break-words">
                        {project.link}
                      </p>
                    )}
                  </div>

                  {(hasText(project.startDate) || hasText(project.endDate)) && (
                    <div className="text-right text-[10px] shrink-0">
                      {hasText(project.startDate) ? project.startDate : ""}
                      {hasText(project.startDate) && hasText(project.endDate)
                        ? " - "
                        : ""}
                      {hasText(project.endDate) ? project.endDate : ""}
                    </div>
                  )}
                </div>

                {hasText(project.description) && (
                  <p className={bodyTextClass}>{project.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!showLanguages) return null;

    return (
      <section key="languages" className={sectionClass}>
        <h2 className={headingClass}>Languages</h2>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3">
          {filledLanguages.map((language: any, index: number) => {
            const languageName = language.language_name || language.name || "";
            const proficiency = language.proficiency || language.level || "";

            return (
              <div key={index}>
                {hasText(languageName) && (
                  <h3 className="text-[12px] font-bold">
                    {languageName}
                  </h3>
                )}

                {hasText(proficiency) && (
                  <p className="mt-1 text-[10px]">
                    {proficiency}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!showCertifications) return null;

    return (
      <section key="certifications" className={sectionClass}>
        <h2 className={headingClass}>Certifications</h2>

        <div className="space-y-4">
          {filledCertifications.map((cert: any, index: number) => {
            const certName = cert.certification_name || cert.name || "";
            const issuer = cert.issuer || cert.company_name || "";
            const date = cert.date_obtained || cert.date || "";

            return (
              <div key={index}>
                {hasText(certName) && (
                  <h3 className={itemTitleClass}>{certName}</h3>
                )}

                {(hasText(issuer) || hasText(date)) && (
                  <p className="mt-1 text-[10px]">
                    {[issuer, date].filter((item) => hasText(item)).join(" • ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCustomSection = (sectionId: string) => {
    const section = filledCustomSections.find(
      (customSection: any) => customSection.id === sectionId
    );

    if (!section) return null;

    const items = Array.isArray(section.items)
      ? section.items.filter((item: any) => {
          if (typeof item === "string") return hasText(item);

          if (typeof item === "object" && item !== null) {
            return Object.values(item).some((value: any) =>
              hasText(String(value || ""))
            );
          }

          return false;
        })
      : [];

    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={sectionClass}>
        <h2 className={headingClass}>{section.title}</h2>

        <ul className="list-disc ml-5 space-y-1 text-[10px] leading-4">
          {items.map((item: any, index: number) => (
            <li key={index}>
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderOrderedSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderOnlinePresence();
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "certifications") return renderCertifications();

    return renderCustomSection(sectionId);
  };

  return (
    <ResumePage>
      <div className="bg-[#f7f7f7] text-[#1f1f1f] p-5 text-[11px] leading-[1.4]" style={{ fontFamily: 'var(--rf)' }}>
        {/* HEADER */}
        {showHeader && (
          <div className="flex justify-between items-start border-b border-gray-500 pb-4">
            <div className="flex-1">
              {hasText(personalInfo.fullName) && (
                <h1 className="text-[26px] font-bold leading-tight">
                  {personalInfo.fullName}
                </h1>
              )}

              {(hasText(personalInfo.jobTitle) ||
                hasText(personalInfo.title)) && (
                <p className="text-gray-700 mt-1 text-[13px]">
                  {personalInfo.jobTitle || personalInfo.title}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-3 text-[10px]">
                {hasText(personalInfo.email) && (
                  <span>{personalInfo.email}</span>
                )}

                {hasText(personalInfo.phone) && (
                  <span>{personalInfo.phone}</span>
                )}

                {hasText(personalInfo.location) && (
                  <span>{personalInfo.location}</span>
                )}

                {hasText(personalInfo.website) && (
                  <span>{personalInfo.website}</span>
                )}
              </div>
            </div>

            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                alt="profile"
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
          </div>
        )}

        {/* ORDERED BODY SECTIONS */}
        {bodyOrder.map((sectionId: string) => renderOrderedSection(sectionId))}
      </div>
    </ResumePage>
  );
};

export default Template7;