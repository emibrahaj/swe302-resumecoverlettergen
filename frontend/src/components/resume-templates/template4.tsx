"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const hasText = (value: any) => {
  return typeof value === "string" && value.trim().length > 0;
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

const Template4: React.FC<Props> = ({ resumeData }) => {
  const {
    personalInfo = {},
    summary = "",
    skills = [],
    education = [],
    experience = [],
    projects = [],
    languages = [],
    certifications = [],
    customSections = [],
  } = resumeData || {};

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

  const filledEducation = Array.isArray(education)
    ? education.filter((edu: any) =>
        hasAnyText(
          edu?.degree,
          edu?.school,
          edu?.university,
          edu?.gpa,
          edu?.location,
          edu?.startDate,
          edu?.endDate,
          edu?.year,
          edu?.description
        )
      )
    : [];

  const filledExperience = Array.isArray(experience)
    ? experience.filter((exp: any) => {
        const hasBullets =
          Array.isArray(exp?.bullets) &&
          exp.bullets.some((bullet: string) => hasText(bullet));

        return (
          hasAnyText(
            exp?.position,
            exp?.title,
            exp?.role,
            exp?.company,
            exp?.companyName,
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

  const showHeader =
    hasText(personalInfo.fullName) ||
    hasText(personalInfo.jobTitle) ||
    hasText(personalInfo.title) ||
    hasText(personalInfo.email) ||
    hasText(personalInfo.phone) ||
    hasText(personalInfo.website) ||
    hasText(personalInfo.github) ||
    hasText(personalInfo.photoUrl);

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "summary",
          "skills",
          "education",
          "experience",
          "projects",
          "languages",
          "certifications",
          ...filledCustomSections.map((section: any) => section.id),
        ];

  const sectionClass = "mb-6 w-full max-w-full overflow-hidden";
  const headingClass =
    "font-bold text-[16px] uppercase border-b-2 pb-1 mb-4 break-words";
  const headingStyle = { color: 'var(--rp)', borderColor: 'var(--rp)' } as React.CSSProperties;
  const itemTitleClass = "text-[12px] font-bold break-words";
  const itemSubClass = "text-[10px] mt-1 text-gray-600 break-words";
  const bodyTextClass = "text-[10px] mt-2 leading-4 break-words";

  const renderSummary = () => {
    if (!hasText(summary)) return null;

    return (
      <section key="summary" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Professional Summary</h2>

        <p className="text-[11px] leading-5 break-words">
          {summary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <section key="skills" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Technical Skills</h2>

        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-5 w-full max-w-full overflow-hidden">
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
            const rating = Number(skillObj.rating) || 0;

            return (
              <div key={index} className="min-w-0 overflow-hidden">
                {hasText(title) && (
                  <h3 className={itemTitleClass}>
                    {title}
                  </h3>
                )}

                {hasText(level) && (
                  <p className={itemSubClass}>
                    {level}
                  </p>
                )}

                {items.length > 0 && (
                  <p className="text-[10px] mt-1 leading-4 break-words">
                    {items.join(", ")}
                  </p>
                )}

                {rating > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={
                          dot <= rating
                            ? { backgroundColor: 'var(--rp)' }
                            : { border: '1px solid var(--rp)' }
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (filledEducation.length === 0) return null;

    return (
      <section key="education" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Education</h2>

        <div className="space-y-5 w-full max-w-full overflow-hidden">
          {filledEducation.map((edu: any, index: number) => {
            const school = edu.school || edu.university || "";
            const endDate = edu.endDate || edu.year || "";

            return (
              <div key={index} className="min-w-0 overflow-hidden">
                <div className="flex justify-between items-start gap-4 min-w-0 overflow-hidden">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex gap-2 flex-wrap items-center min-w-0">
                      {hasText(edu.degree) && (
                        <h3 className="text-[12px] break-words min-w-0">
                          {edu.degree}
                        </h3>
                      )}

                      {hasText(school) && (
                        <span className="text-[12px] font-bold break-words min-w-0">
                          {school}
                        </span>
                      )}
                    </div>

                    {(hasText(edu.gpa) || hasText(edu.location)) && (
                      <p className="text-[10px] mt-2 text-gray-700 break-words">
                        {[edu.gpa, edu.location]
                          .filter((item) => hasText(item))
                          .join(" • ")}
                      </p>
                    )}
                  </div>

                  {(hasText(edu.startDate) || hasText(endDate)) && (
                    <div className="text-[10px] shrink-0 text-right max-w-[150px] break-words">
                      {hasText(edu.startDate) ? edu.startDate : ""}
                      {hasText(edu.startDate) && hasText(endDate)
                        ? " – "
                        : ""}
                      {hasText(endDate) ? endDate : ""}
                    </div>
                  )}
                </div>

                {hasText(edu.description) && (
                  <p className={bodyTextClass}>
                    {edu.description}
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
    if (filledExperience.length === 0) return null;

    return (
      <section key="experience" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Professional Experience</h2>

        <div className="space-y-6 w-full max-w-full overflow-hidden">
          {filledExperience.map((exp: any, index: number) => {
            const position = exp.position || exp.title || exp.role || "";
            const company = exp.company || exp.companyName || "";

            const bullets = Array.isArray(exp.bullets)
              ? exp.bullets.filter((bullet: string) => hasText(bullet))
              : hasText(exp.description)
                ? [exp.description]
                : [];

            return (
              <div key={index} className="min-w-0 overflow-hidden">
                <div className="flex justify-between items-start gap-4 min-w-0 overflow-hidden">
                  <div className="flex gap-2 flex-wrap items-center min-w-0 flex-1 overflow-hidden">
                    {hasText(position) && (
                      <h3 className="text-[12px] break-words min-w-0">
                        {position}
                      </h3>
                    )}

                    {hasText(company) && (
                      <span className="text-[12px] font-bold break-words min-w-0">
                        {company}
                      </span>
                    )}
                  </div>

                  {(hasText(exp.startDate) || hasText(exp.endDate)) && (
                    <div className="text-right text-[10px] shrink-0 max-w-[150px] break-words">
                      {hasText(exp.startDate) ? exp.startDate : ""}
                      {hasText(exp.startDate) && hasText(exp.endDate)
                        ? " – "
                        : ""}
                      {hasText(exp.endDate) ? exp.endDate : ""}
                    </div>
                  )}
                </div>

                {hasText(exp.location) && (
                  <p className="text-[10px] mt-1 text-gray-600 break-words">
                    {exp.location}
                  </p>
                )}

                {bullets.length > 0 && (
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-[10px] leading-4 break-words">
                    {bullets.map((bullet: string, i: number) => (
                      <li key={i} className="break-words">
                        {bullet}
                      </li>
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
    if (filledProjects.length === 0) return null;

    return (
      <section key="projects" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Projects</h2>

        <div className="space-y-5 w-full max-w-full overflow-hidden">
          {filledProjects.map((project: any, index: number) => {
            const projectName =
              project.name || project.title || project.project_name || "";

            return (
              <div key={index} className="min-w-0 overflow-hidden">
                <div className="flex justify-between items-start gap-4 min-w-0 overflow-hidden">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    {hasText(projectName) && (
                      <h3 className={itemTitleClass}>
                        {projectName}
                      </h3>
                    )}

                    {hasText(project.link) && (
                      <p className="text-[10px] mt-1 break-all" style={{ color: 'var(--rp)' }}>
                        {project.link}
                      </p>
                    )}
                  </div>

                  {(hasText(project.startDate) || hasText(project.endDate)) && (
                    <div className="text-[10px] shrink-0 text-right max-w-[150px] break-words">
                      {hasText(project.startDate) ? project.startDate : ""}
                      {hasText(project.startDate) && hasText(project.endDate)
                        ? " – "
                        : ""}
                      {hasText(project.endDate) ? project.endDate : ""}
                    </div>
                  )}
                </div>

                {hasText(project.description) && (
                  <p className={bodyTextClass}>
                    {project.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (filledLanguages.length === 0) return null;

    return (
      <section key="languages" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Languages</h2>

        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 w-full max-w-full overflow-hidden">
          {filledLanguages.map((language: any, index: number) => {
            const languageName = language.language_name || language.name || "";
            const proficiency = language.proficiency || language.level || "";

            return (
              <div key={index} className="min-w-0 overflow-hidden">
                {hasText(languageName) && (
                  <h3 className={itemTitleClass}>
                    {languageName}
                  </h3>
                )}

                {hasText(proficiency) && (
                  <p className={itemSubClass}>
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
    if (filledCertifications.length === 0) return null;

    return (
      <section key="certifications" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>Certifications</h2>

        <div className="space-y-4 w-full max-w-full overflow-hidden">
          {filledCertifications.map((cert: any, index: number) => {
            const certName = cert.certification_name || cert.name || "";
            const issuer = cert.issuer || cert.company_name || "";
            const date = cert.date_obtained || cert.date || "";

            return (
              <div key={index} className="min-w-0 overflow-hidden">
                {hasText(certName) && (
                  <h3 className={itemTitleClass}>
                    {certName}
                  </h3>
                )}

                {(hasText(issuer) || hasText(date)) && (
                  <p className={itemSubClass}>
                    {[issuer, date]
                      .filter((item) => hasText(item))
                      .join(" • ")}
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
        <h2 className={headingClass} style={headingStyle}>
          {section.title}
        </h2>

        <div className="space-y-3 w-full max-w-full overflow-hidden">
          {items.map((item: any, i: number) => (
            <div key={i} className="text-[10px] leading-4 break-words">
              {typeof item === "string" && <p>{item}</p>}

              {typeof item === "object" && item !== null && (
                <>
                  {item.name && (
                    <p className="font-semibold text-[11px] break-words">
                      {item.name}
                    </p>
                  )}

                  {item.level && (
                    <p className="text-gray-600 break-words">
                      {item.level}
                    </p>
                  )}

                  {item.description && (
                    <p className="mt-1 break-words">
                      {item.description}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderOrderedSection = (sectionId: string) => {
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "certifications") return renderCertifications();

    return renderCustomSection(sectionId);
  };

  return (
    <ResumePage>
      <div className="w-full max-w-full min-h-full overflow-hidden box-border bg-[#f5f5f5] text-[#1d1d1d] p-5 text-[11px] leading-[1.4]" style={{ fontFamily: 'var(--rf)' }}>
        {/* HEADER */}
        {showHeader && (
          <div className="w-full max-w-full flex items-start justify-between gap-4 mb-6 border-b pb-4 overflow-hidden" style={{ borderColor: 'var(--rp)' }}>
            <div className="flex-1 min-w-0 overflow-hidden">
              {hasText(personalInfo.fullName) && (
                <h1 className="text-[28px] font-bold leading-tight break-words">
                  {personalInfo.fullName}
                </h1>
              )}

              {(hasText(personalInfo.jobTitle) ||
                hasText(personalInfo.title)) && (
                <p className="text-[12px] mt-1 text-gray-700 break-words">
                  {personalInfo.jobTitle || personalInfo.title}
                </p>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-[10px] min-w-0 max-w-full overflow-hidden">
                {hasText(personalInfo.email) && (
                  <span className="break-all min-w-0 max-w-full">
                    {personalInfo.email}
                  </span>
                )}

                {hasText(personalInfo.phone) && (
                  <span className="break-words min-w-0 max-w-full">
                    {personalInfo.phone}
                  </span>
                )}

                {hasText(personalInfo.website) && (
                  <span className="break-all min-w-0 max-w-full">
                    {personalInfo.website}
                  </span>
                )}

                {hasText(personalInfo.github) && (
                  <span className="break-all min-w-0 max-w-full">
                    {personalInfo.github}
                  </span>
                )}
              </div>
            </div>

            {hasText(personalInfo.photoUrl) && (
              <img
                src={personalInfo.photoUrl}
                alt="profile"
                className="w-20 h-20 object-cover shrink-0 max-w-[80px]"
              />
            )}
          </div>
        )}

        {/* ORDERED SECTIONS */}
        {bodyOrder.map((sectionId: string) => renderOrderedSection(sectionId))}
      </div>
    </ResumePage>
  );
};

export default Template4;