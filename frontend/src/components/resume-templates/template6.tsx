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

const Template6: React.FC<Props> = ({ resumeData }) => {
  const {
    personalInfo = {},
    summary = "",
    education = [],
    experience = [],
    links = [],
    skills: simpleSkills = [],
    technicalSkills = [],
    projects = [],
    languages = [],
    certifications = [],
    customSections = [],
  } = resumeData || {};

  const skills =
    Array.isArray(technicalSkills) && technicalSkills.length > 0
      ? technicalSkills
      : simpleSkills;

  const fullName = personalInfo.fullName || personalInfo.name || "";

  const jobTitle =
    personalInfo.jobTitle ||
    personalInfo.title ||
    personalInfo.professionalTitle ||
    "";

  const photoUrl =
    personalInfo.photoUrl ||
    personalInfo.photo ||
    resumeData?.photoUrl ||
    "";

  const filledEducation = Array.isArray(education)
    ? education.filter((edu: any) =>
        hasAnyText(
          edu.school,
          edu.university,
          edu.degree,
          edu.gpa,
          edu.location,
          edu.startDate,
          edu.endDate,
          edu.year,
          edu.description
        )
      )
    : [];

  const filledExperience = Array.isArray(experience)
    ? experience.filter((exp: any) => {
        const hasBullets =
          Array.isArray(exp.bullets) &&
          exp.bullets.some((bullet: string) => hasText(bullet));

        return (
          hasAnyText(
            exp.company,
            exp.companyName,
            exp.position,
            exp.title,
            exp.role,
            exp.location,
            exp.startDate,
            exp.endDate,
            exp.description
          ) || hasBullets
        );
      })
    : [];

  const filledLinks = Array.isArray(links)
    ? links.filter((link: any) => hasAnyText(link.platform, link.url))
    : [];

  const filledSkills = Array.isArray(skills)
    ? skills.filter((skill: any) => {
        if (typeof skill === "string") {
          return hasText(skill);
        }

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

  const hasHeader =
    hasText(fullName) ||
    hasText(jobTitle) ||
    hasText(personalInfo.location) ||
    hasText(personalInfo.email) ||
    hasText(personalInfo.phone) ||
    hasText(personalInfo.website) ||
    hasText(personalInfo.github) ||
    hasText(personalInfo.linkedin) ||
    hasText(photoUrl);

  const hasSummary = hasText(summary);
  const hasEducation = filledEducation.length > 0;
  const hasExperience = filledExperience.length > 0;
  const hasLinks = filledLinks.length > 0;
  const hasSkills = filledSkills.length > 0;
  const hasProjects = filledProjects.length > 0;
  const hasLanguages = filledLanguages.length > 0;
  const hasCertifications = filledCertifications.length > 0;

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "summary",
          "education",
          "experience",
          "onlinePresence",
          "skills",
          "projects",
          "languages",
          "certifications",
          ...filledCustomSections.map((section: any) => section.id),
        ];

  const safeTextClass = "break-words [overflow-wrap:anywhere]";
  const safeBlockClass = "min-w-0 break-words [overflow-wrap:anywhere]";

  const sectionClass = `mt-5 border-b border-gray-300 pb-4 last:border-b-0 overflow-hidden ${safeBlockClass}`;
  const headingClass = `text-[16px] font-bold uppercase mb-3 ${safeTextClass}`;
  const titleClass = `text-[13px] font-bold ${safeTextClass}`;
  const smallTextClass = `text-[11px] mt-1 ${safeTextClass}`;
  const descriptionClass = `text-[10px] mt-2 leading-4 ${safeTextClass}`;
  const metaClass = `text-right text-[10px] text-gray-700 shrink-0 max-w-[40%] ${safeTextClass}`;

  const renderSummary = () => {
    if (!hasSummary) return null;

    return (
      <section key="summary" className={sectionClass}>
        <h2 className={headingClass}>Summary</h2>

        <p className={`text-[11px] leading-5 ${safeTextClass}`}>{summary}</p>
      </section>
    );
  };

  const renderEducation = () => {
    if (!hasEducation) return null;

    return (
      <section key="education" className={sectionClass}>
        <h2 className={headingClass}>Education</h2>

        <div className="space-y-4 min-w-0">
          {filledEducation.map((edu: any, index: number) => {
            const school = edu.school || edu.university || "";
            const endDate = edu.endDate || edu.year || "";

            const dateText =
              hasText(edu.startDate) && hasText(endDate)
                ? `${edu.startDate} - ${endDate}`
                : hasText(edu.startDate)
                  ? edu.startDate
                  : hasText(endDate)
                    ? endDate
                    : "";

            return (
              <div key={index} className={safeBlockClass}>
                <div className="flex justify-between items-start gap-4 min-w-0">
                  <div className={safeBlockClass}>
                    {hasText(school) && <h3 className={titleClass}>{school}</h3>}

                    {hasText(edu.degree) && (
                      <p className={smallTextClass}>{edu.degree}</p>
                    )}
                  </div>

                  {(hasText(edu.gpa) ||
                    hasText(edu.location) ||
                    hasText(dateText)) && (
                    <div className={metaClass}>
                      {hasText(edu.gpa) && <p>{edu.gpa}</p>}

                      {(hasText(edu.location) || hasText(dateText)) && (
                        <p>
                          {[edu.location, dateText]
                            .filter((item) => hasText(item))
                            .join(" • ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {hasText(edu.description) && (
                  <p className={descriptionClass}>{edu.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!hasExperience) return null;

    return (
      <section key="experience" className={sectionClass}>
        <h2 className={headingClass}>Experience</h2>

        <div className="space-y-5 min-w-0">
          {filledExperience.map((exp: any, index: number) => {
            const company = exp.company || exp.companyName || "";
            const position = exp.position || exp.title || exp.role || "";

            const bullets = Array.isArray(exp.bullets)
              ? exp.bullets.filter((bullet: string) => hasText(bullet))
              : hasText(exp.description)
                ? [exp.description]
                : [];

            return (
              <div key={index} className={safeBlockClass}>
                <div className="flex justify-between gap-4 min-w-0">
                  <div className={safeBlockClass}>
                    {hasText(company) && (
                      <h3 className={titleClass}>{company}</h3>
                    )}

                    {hasText(position) && (
                      <p className={smallTextClass}>{position}</p>
                    )}
                  </div>

                  {(hasText(exp.location) ||
                    hasText(exp.startDate) ||
                    hasText(exp.endDate)) && (
                    <div className={metaClass}>
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
                  <ul
                    className={`list-disc ml-5 mt-2 space-y-1 text-[10px] leading-4 ${safeTextClass}`}
                  >
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

  const renderProfiles = () => {
    if (!hasLinks) return null;

    return (
      <section key="onlinePresence" className={sectionClass}>
        <h2 className={headingClass}>Profiles</h2>

        <div className="space-y-3 min-w-0">
          {filledLinks.map((link: any, index: number) => (
            <div key={index} className={safeBlockClass}>
              {hasText(link.platform) && (
                <h3 className={`text-[12px] font-bold ${safeTextClass}`}>
                  {link.platform}
                </h3>
              )}

              {hasText(link.url) && (
                <p
                  className={`text-[10px] mt-1 ${safeTextClass}`}
                  style={{ color: "var(--rp)" }}
                >
                  {link.url}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!hasSkills) return null;

    return (
      <section key="skills" className={sectionClass}>
        <h2 className={headingClass}>Skills</h2>

        <div className="space-y-4 min-w-0">
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

            const items = normalizeSkillItems(skillObj.items);

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

            return (
              <div key={index} className={safeBlockClass}>
                {hasText(title) && (
                  <h3 className={`text-[12px] font-bold ${safeTextClass}`}>
                    {title}
                  </h3>
                )}

                {hasText(level) && <p className={smallTextClass}>{level}</p>}

                {items.length > 0 && (
                  <p className={`text-[10px] mt-1 leading-4 ${safeTextClass}`}>
                    {items.join(", ")}
                  </p>
                )}

                {Number(skillObj.rating) > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`text-[14px] leading-none ${
                          star <= Number(skillObj.rating) ? "" : "text-gray-300"
                        }`}
                        style={
                          star <= Number(skillObj.rating)
                            ? { color: "var(--rp)" }
                            : {}
                        }
                      >
                        ★
                      </div>
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

  const renderProjects = () => {
    if (!hasProjects) return null;

    return (
      <section key="projects" className={sectionClass}>
        <h2 className={headingClass}>Projects</h2>

        <div className="space-y-4 min-w-0">
          {filledProjects.map((project: any, index: number) => {
            const projectName =
              project.name || project.title || project.project_name || "";

            return (
              <div key={index} className={safeBlockClass}>
                <div className="flex justify-between gap-4 min-w-0">
                  <div className={safeBlockClass}>
                    {hasText(projectName) && (
                      <h3 className={titleClass}>{projectName}</h3>
                    )}

                    {hasText(project.link) && (
                      <p
                        className={`text-[10px] mt-1 ${safeTextClass}`}
                        style={{ color: "var(--rp)" }}
                      >
                        {project.link}
                      </p>
                    )}
                  </div>

                  {(hasText(project.startDate) || hasText(project.endDate)) && (
                    <div className={metaClass}>
                      {hasText(project.startDate) ? project.startDate : ""}
                      {hasText(project.startDate) && hasText(project.endDate)
                        ? " - "
                        : ""}
                      {hasText(project.endDate) ? project.endDate : ""}
                    </div>
                  )}
                </div>

                {hasText(project.description) && (
                  <p className={descriptionClass}>{project.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!hasLanguages) return null;

    return (
      <section key="languages" className={sectionClass}>
        <h2 className={headingClass}>Languages</h2>

        <div className="grid grid-cols-2 gap-3 min-w-0">
          {filledLanguages.map((language: any, index: number) => {
            const languageName = language.language_name || language.name || "";
            const proficiency = language.proficiency || language.level || "";

            return (
              <div key={index} className={safeBlockClass}>
                {hasText(languageName) && (
                  <h3 className={`text-[12px] font-bold ${safeTextClass}`}>
                    {languageName}
                  </h3>
                )}

                {hasText(proficiency) && (
                  <p className={`text-[10px] mt-1 text-gray-700 ${safeTextClass}`}>
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
    if (!hasCertifications) return null;

    return (
      <section key="certifications" className={sectionClass}>
        <h2 className={headingClass}>Certifications</h2>

        <div className="space-y-4 min-w-0">
          {filledCertifications.map((cert: any, index: number) => {
            const certName = cert.certification_name || cert.name || "";
            const issuer = cert.issuer || cert.company_name || "";
            const date = cert.date_obtained || cert.date || "";

            return (
              <div key={index} className={safeBlockClass}>
                {hasText(certName) && (
                  <h3 className={titleClass}>{certName}</h3>
                )}

                {(hasText(issuer) || hasText(date)) && (
                  <p className={`text-[10px] mt-1 text-gray-700 ${safeTextClass}`}>
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

        <ul
          className={`list-disc ml-5 space-y-1 text-[10px] leading-4 ${safeTextClass}`}
        >
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
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "onlinePresence" || sectionId === "profiles") {
      return renderProfiles();
    }
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "projects") return renderProjects();
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "certifications") return renderCertifications();

    return renderCustomSection(sectionId);
  };

  return (
    <ResumePage>
      <div
        className="bg-[#f7f7f7] text-[#2b2b2b] p-5 border-t-[6px] text-[11px] leading-[1.4] min-h-full overflow-hidden break-words [overflow-wrap:anywhere]"
        style={{ fontFamily: "var(--rf)", borderColor: "var(--rp)" }}
      >
        {/* HEADER */}
        {hasHeader && (
          <div className="flex justify-between items-start border-b border-gray-300 pb-4 overflow-hidden min-w-0">
            <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
              {hasText(fullName) && (
                <h1 className="text-[26px] font-bold leading-tight break-words [overflow-wrap:anywhere]">
                  {fullName}
                </h1>
              )}

              {hasText(jobTitle) && (
                <p className="text-[14px] text-gray-600 mt-1 break-words [overflow-wrap:anywhere]">
                  {jobTitle}
                </p>
              )}

             <div
  className="flex flex-wrap gap-3 mt-3 text-[10px] min-w-0 break-words [overflow-wrap:anywhere]"
  style={{ color: "var(--rp)" }}
>
  {hasText(personalInfo.location) && (
    <span className={safeTextClass}>⊙ {personalInfo.location}</span>
  )}

  {hasText(personalInfo.email) && (
    <span className={safeTextClass}>✉ {personalInfo.email}</span>
  )}

  {hasText(personalInfo.phone) && (
    <span className={safeTextClass}>☎ {personalInfo.phone}</span>
  )}

  {hasText(personalInfo.website) && (
    <span className="break-all [overflow-wrap:anywhere]">
      🌐 {personalInfo.website}
    </span>
  )}
</div>

              {(hasText(personalInfo.github) ||
                hasText(personalInfo.linkedin)) && (
                <div
                  className="flex flex-wrap gap-3 mt-2 text-[10px] min-w-0 break-words [overflow-wrap:anywhere]"
                  style={{ color: "var(--rp)" }}
                >
                  {hasText(personalInfo.github) && (
                    <span className="break-all [overflow-wrap:anywhere]">
                      {personalInfo.github}
                    </span>
                  )}

                  {hasText(personalInfo.linkedin) && (
                    <span className="break-all [overflow-wrap:anywhere]">
                      {personalInfo.linkedin}
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasText(photoUrl) && (
              <img
                src={photoUrl}
                alt="profile"
                className="w-24 h-24 object-cover ml-4 shrink-0"
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

export default Template6;