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

const ratingFromLevel = (level: string) => {
  const normalized = String(level || "").toLowerCase();

  if (normalized.includes("expert")) return 5;
  if (normalized.includes("advanced")) return 4;
  if (normalized.includes("intermediate")) return 3;
  if (normalized.includes("beginner")) return 2;
  if (normalized.includes("native")) return 5;
  if (normalized.includes("fluent")) return 4;
  if (normalized.includes("professional")) return 4;
  if (normalized.includes("conversational")) return 3;
  if (normalized.includes("basic")) return 2;

  return 4;
};

const Template8: React.FC<Props> = ({ resumeData }) => {
  const {
    personalInfo = {},
    summary = "",
    skills = [],
    experience = [],
    education = [],
    links = [],
    projects = [],
    languages = [],
    certifications = [],
    awards = [],
    interests = [],
    customSections = [],
  } = resumeData || {};

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

  const allLinks = Array.isArray(links)
    ? links
    : Array.isArray(personalInfo.links)
      ? personalInfo.links
      : [];

  const filledLinks = allLinks.filter((link: any) =>
    hasAnyText(link?.platform, link?.url, link?.label, link?.link)
  );

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
          edu?.school,
          edu?.university,
          edu?.degree,
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
    ? languages.filter((lang: any) =>
        hasAnyText(
          lang?.language_name,
          lang?.language,
          lang?.name,
          lang?.proficiency,
          lang?.level
        )
      )
    : [];

  const filledCertifications = Array.isArray(certifications)
    ? certifications.filter((cert: any) =>
        hasAnyText(
          cert?.certification_name,
          cert?.title,
          cert?.name,
          cert?.issuer,
          cert?.company_name,
          cert?.provider,
          cert?.organization,
          cert?.date_obtained,
          cert?.date,
          cert?.year
        )
      )
    : [];

  const filledAwards = Array.isArray(awards)
    ? awards.filter((award: any) =>
        hasAnyText(award?.title, award?.name, award?.date, award?.description)
      )
    : [];

  const filledInterests = Array.isArray(interests)
    ? interests.filter((interest: any) => {
        if (typeof interest === "string") return hasText(interest);
        return hasAnyText(interest?.name, interest?.title);
      })
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

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "onlinePresence",
          "summary",
          "skills",
          "education",
          "experience",
          "projects",
          "certifications",
          "languages",
          ...filledCustomSections.map((section: any) => section.id),
        ];

  const sidebarIds = ["certifications", "awards", "languages", "interests"];

  const mainOrder = bodyOrder.filter(
    (sectionId: string) => !sidebarIds.includes(sectionId)
  );

  const sidebarOrder = bodyOrder.filter((sectionId: string) =>
    sidebarIds.includes(sectionId)
  );

  const finalSidebarOrder =
    sidebarOrder.length > 0
      ? sidebarOrder
      : ["certifications", "awards", "languages", "interests"];

  const mainSectionClass = "mt-[22px] border-t border-[#0f7a54] pt-[8px]";
  const mainHeadingClass =
    "text-[14px] text-[#0f7a54] font-bold mb-[10px]";
  const sidebarSectionClass = "mb-[26px]";
  const sidebarHeadingClass =
    "text-[14px] font-bold border-b border-white pb-[6px] mb-[10px]";

  const renderHeader = () => {
    const hasHeader =
      hasText(fullName) ||
      hasText(jobTitle) ||
      hasText(personalInfo.email) ||
      hasText(personalInfo.phone) ||
      hasText(personalInfo.location) ||
      hasText(personalInfo.website) ||
      hasText(photoUrl);

    if (!hasHeader) return null;

    return (
      <div className="flex gap-[14px] items-start">
        {hasText(photoUrl) && (
          <img
            src={photoUrl}
            alt="profile"
            className="w-[78px] h-[78px] object-cover shrink-0"
          />
        )}

        <div className="min-w-0 flex-1">
          {hasText(fullName) && (
            <h1 className="m-0 text-[28px] font-bold leading-tight break-words">
              {fullName}
            </h1>
          )}

          {hasText(jobTitle) && (
            <div className="mt-[4px] text-[#555] text-[11px] leading-[1.35] break-words">
              {jobTitle}
            </div>
          )}

          <div className="mt-[10px] text-[9px] leading-[1.65] break-words">
            {hasText(personalInfo.email) && <div>✉ {personalInfo.email}</div>}
            {hasText(personalInfo.phone) && <div>☎ {personalInfo.phone}</div>}
            {hasText(personalInfo.location) && (
              <div>⌾ {personalInfo.location}</div>
            )}
            {hasText(personalInfo.website) && (
              <div>⊕ {personalInfo.website}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOnlinePresence = () => {
    if (filledLinks.length === 0) return null;

    return (
      <section key="onlinePresence" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Online Presence</h2>

        <div className="grid grid-cols-2 gap-x-[16px] gap-y-[8px]">
          {filledLinks.map((link: any, index: number) => {
            const platform = link.platform || link.label || "";
            const url = link.url || link.link || "";

            return (
              <div key={index} className="text-[9px] leading-[1.45]">
                {hasText(platform) && (
                  <strong className="block">{platform}</strong>
                )}

                {hasText(url) && (
                  <div className="mt-[3px] break-words">{url}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderSummary = () => {
    if (!hasText(summary)) return null;

    return (
      <section key="summary" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Professional Summary</h2>

        <div className="text-[9.5px] leading-[1.65]">
          {summary}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <section key="skills" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Technical Skills</h2>

        <div className="grid grid-cols-2 gap-x-[20px] gap-y-[14px]">
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

            const rating =
              Number(skillObj.rating) > 0
                ? Number(skillObj.rating)
                : ratingFromLevel(level);

            return (
              <div key={index}>
                {hasText(title) && (
                  <div className="text-[11px] font-bold">
                    {title}
                  </div>
                )}

                {hasText(level) && (
                  <div className="mt-[3px] text-[9px]">
                    {level}
                  </div>
                )}

                {items.length > 0 && (
                  <div className="mt-[4px] text-[8.5px] leading-[1.45]">
                    {items.join(", ")}
                  </div>
                )}

                {rating > 0 && (
                  <div className="flex gap-[3px] mt-[6px]">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`w-[14px] h-[5px] ${
                          bar <= rating ? "bg-[#0f7a54]" : "bg-[#d7e7df]"
                        }`}
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
      <section key="education" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Education</h2>

        <div className="space-y-[14px]">
          {filledEducation.map((edu: any, index: number) => {
            const school = edu.school || edu.university || "";
            const endDate = edu.endDate || edu.year || "";

            return (
              <div key={index}>
                <div className="flex justify-between items-start gap-[12px]">
                  <div className="min-w-0 flex-1">
                    {hasText(school) && (
                      <div className="text-[11px] font-bold">
                        {school}
                      </div>
                    )}

                    {hasText(edu.degree) && (
                      <div className="text-[9.5px] mt-[3px]">
                        {edu.degree}
                      </div>
                    )}
                  </div>

                  {(hasText(edu.gpa) ||
                    hasText(edu.location) ||
                    hasText(edu.startDate) ||
                    hasText(endDate)) && (
                    <div className="text-right text-[8.5px] shrink-0 max-w-[150px]">
                      {hasText(edu.gpa) && <div>{edu.gpa}</div>}

                      {(hasText(edu.location) ||
                        hasText(edu.startDate) ||
                        hasText(endDate)) && (
                        <div>
                          {[edu.location,
                            `${edu.startDate || ""}${
                              edu.startDate && endDate ? " - " : ""
                            }${endDate || ""}`,
                          ]
                            .filter((item) => hasText(item))
                            .join(" • ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {hasText(edu.description) && (
                  <div className="mt-[7px] text-[8.5px] leading-[1.55]">
                    {edu.description}
                  </div>
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
      <section key="experience" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Professional Experience</h2>

        <div className="space-y-[14px]">
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
                <div className="flex justify-between items-start gap-[12px]">
                  <div className="min-w-0 flex-1">
                    {hasText(company) && (
                      <div className="text-[11px] font-bold">
                        {company}
                      </div>
                    )}

                    {hasText(position) && (
                      <div className="text-[9.5px] mt-[3px]">
                        {position}
                      </div>
                    )}
                  </div>

                  {(hasText(exp.location) ||
                    hasText(exp.startDate) ||
                    hasText(exp.endDate)) && (
                    <div className="text-right text-[8.5px] shrink-0 max-w-[150px]">
                      {hasText(exp.location) && <div>{exp.location}</div>}

                      {(hasText(exp.startDate) || hasText(exp.endDate)) && (
                        <div>
                          {hasText(exp.startDate) ? exp.startDate : ""}
                          {hasText(exp.startDate) && hasText(exp.endDate)
                            ? " - "
                            : ""}
                          {hasText(exp.endDate) ? exp.endDate : ""}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {bullets.length > 0 && (
                  <ul className="mt-[7px] pl-[16px] list-disc space-y-[4px] text-[8.5px] leading-[1.55]">
                    {bullets.map((bullet: string, bulletIndex: number) => (
                      <li key={bulletIndex}>{bullet}</li>
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
      <section key="projects" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Projects</h2>

        <div className="space-y-[14px]">
          {filledProjects.map((project: any, index: number) => {
            const projectName =
              project.name || project.title || project.project_name || "";

            return (
              <div key={index}>
                <div className="flex justify-between items-start gap-[12px]">
                  <div className="min-w-0 flex-1">
                    {hasText(projectName) && (
                      <div className="text-[11px] font-bold">
                        {projectName}
                      </div>
                    )}

                    {hasText(project.link) && (
                      <div className="text-[8.5px] mt-[3px] break-words">
                        {project.link}
                      </div>
                    )}
                  </div>

                  {(hasText(project.startDate) || hasText(project.endDate)) && (
                    <div className="text-right text-[8.5px] shrink-0 max-w-[130px]">
                      {hasText(project.startDate) ? project.startDate : ""}
                      {hasText(project.startDate) && hasText(project.endDate)
                        ? " - "
                        : ""}
                      {hasText(project.endDate) ? project.endDate : ""}
                    </div>
                  )}
                </div>

                {hasText(project.description) && (
                  <div className="mt-[7px] text-[8.5px] leading-[1.55]">
                    {project.description}
                  </div>
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
      <section key={sectionId} className={mainSectionClass}>
        <h2 className={mainHeadingClass}>{section.title}</h2>

        <ul className="mt-[7px] pl-[16px] list-disc space-y-[4px] text-[8.5px] leading-[1.55]">
          {items.map((item: any, index: number) => (
            <li key={index}>
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderCertifications = () => {
    if (filledCertifications.length === 0) return null;

    return (
      <div key="certifications" className={sidebarSectionClass}>
        <div className={sidebarHeadingClass}>Certifications</div>

        {filledCertifications.map((cert: any, index: number) => {
          const title =
            cert.title ||
            cert.certification_name ||
            cert.name ||
            "Certification";

          const date = cert.date || cert.date_obtained || cert.year || "";

          const provider =
            cert.provider ||
            cert.issuer ||
            cert.company_name ||
            cert.organization ||
            "";

          return (
            <div key={index} className="mb-[12px]">
              {hasText(title) && (
                <div className="font-bold text-[10px]">
                  {title}
                </div>
              )}

              {hasText(date) && (
                <div className="text-[8.5px] mt-[3px] leading-[1.45]">
                  {date}
                </div>
              )}

              {hasText(provider) && (
                <div className="text-[8.5px] mt-[3px] leading-[1.45]">
                  {provider}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAwards = () => {
    if (filledAwards.length === 0) return null;

    return (
      <div key="awards" className={sidebarSectionClass}>
        <div className={sidebarHeadingClass}>Awards & Recognition</div>

        {filledAwards.map((award: any, index: number) => {
          const title = award.title || award.name || "";

          return (
            <div key={index} className="mb-[12px]">
              {hasText(title) && (
                <div className="font-bold text-[10px]">{title}</div>
              )}

              {hasText(award.date) && (
                <div className="text-[8.5px] mt-[3px] leading-[1.45]">
                  {award.date}
                </div>
              )}

              {hasText(award.description) && (
                <div className="text-[8.5px] mt-[3px] leading-[1.45]">
                  {award.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLanguages = () => {
    if (filledLanguages.length === 0) return null;

    return (
      <div key="languages" className={sidebarSectionClass}>
        <div className={sidebarHeadingClass}>Languages</div>

        {filledLanguages.map((lang: any, index: number) => {
          const language =
            lang.language ||
            lang.language_name ||
            lang.name ||
            "";

          const level = lang.level || lang.proficiency || "";

          return (
            <div
              key={index}
              className="flex justify-between gap-[8px] mb-[6px] text-[9px]"
            >
              <span>{language}</span>
              <span>{level}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInterests = () => {
    if (filledInterests.length === 0) return null;

    return (
      <div key="interests" className={sidebarSectionClass}>
        <div className={sidebarHeadingClass}>Interests</div>

        <ul className="pl-[14px] list-disc space-y-[6px] text-[8.5px] leading-[1.45]">
          {filledInterests.map((interest: any, index: number) => (
            <li key={index}>
              {typeof interest === "string"
                ? interest
                : interest.name || interest.title}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderMainSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderOnlinePresence();
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();

    if (
      sectionId === "certifications" ||
      sectionId === "languages" ||
      sectionId === "awards" ||
      sectionId === "interests"
    ) {
      return null;
    }

    return renderCustomSection(sectionId);
  };

  const renderSidebarSection = (sectionId: string) => {
    if (sectionId === "certifications") return renderCertifications();
    if (sectionId === "awards") return renderAwards();
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "interests") return renderInterests();

    return null;
  };

  return (
    <ResumePage>
      <div className="flex min-h-full bg-[#f5f5f5] text-[#222] font-serif text-[10px] leading-[1.35]">
        {/* LEFT SIDE */}
        <div className="w-[72%] p-[22px] box-border">
          {renderHeader()}

          {mainOrder.map((sectionId: string) => renderMainSection(sectionId))}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[28%] bg-[#0f7a54] text-white p-[18px] box-border">
          {finalSidebarOrder.map((sectionId: string) =>
            renderSidebarSection(sectionId)
          )}
        </aside>
      </div>
    </ResumePage>
  );
};

export default Template8;