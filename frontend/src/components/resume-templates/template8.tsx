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
  if (normalized.includes("professional")) return 3;
  if (normalized.includes("conversational")) return 2;
  if (normalized.includes("basic")) return 1;

  return 4;
};

const uniqueOrder = (items: string[]) => {
  return items.filter((item, index) => item && items.indexOf(item) === index);
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

  const trainingSections = filledCustomSections.filter((section: any) => {
    const title = String(section.title || "").toLowerCase();

    return title.includes("training");
  });

  const trainingSectionIds = trainingSections.map((section: any) => section.id);

  const nonTrainingCustomSections = filledCustomSections.filter(
    (section: any) => !trainingSectionIds.includes(section.id)
  );

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
          ...trainingSectionIds,
          "languages",
          "awards",
          "interests",
          ...nonTrainingCustomSections.map((section: any) => section.id),
        ];

  const forcedSidebarIds = ["certifications", "languages", ...trainingSectionIds];

  const optionalSidebarIds = ["awards", "interests"];

  const sidebarIds = [...forcedSidebarIds, ...optionalSidebarIds];

  const mainOrder = bodyOrder.filter(
    (sectionId: string) => !sidebarIds.includes(sectionId)
  );

  const sidebarOrderFromBody = bodyOrder.filter((sectionId: string) =>
    sidebarIds.includes(sectionId)
  );

  const missingSidebarIds = sidebarIds.filter(
    (sectionId: string) => !sidebarOrderFromBody.includes(sectionId)
  );

  const finalSidebarOrder = uniqueOrder([
    ...sidebarOrderFromBody,
    ...missingSidebarIds,
  ]);

  const safeTextClass = "break-words [overflow-wrap:anywhere]";
  const safeBlockClass = "min-w-0 break-words [overflow-wrap:anywhere]";
  const safeSectionClass = "min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]";

  const mainSectionClass = `mt-4 border-t border-[#0f7a54] pt-2 ${safeSectionClass}`;
  const mainHeadingClass = `text-[15px] text-[#0f7a54] font-bold ${safeTextClass}`;
  const sidebarSectionClass = `mb-6 ${safeSectionClass}`;
  const sidebarHeadingClass = `text-[15px] font-bold border-b border-white pb-1 ${safeTextClass}`;
  const metaClass = `text-right text-[11.5px] shrink-0 max-w-[38%] ${safeTextClass}`;

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
      <div className="flex gap-4 items-start min-w-0 overflow-hidden">
        {hasText(photoUrl) && (
          <img
            src={photoUrl}
            alt="profile"
            className="w-20 h-20 object-cover shrink-0"
          />
        )}

        <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
          {hasText(fullName) && (
            <h1 className="text-[24px] font-bold leading-tight break-words [overflow-wrap:anywhere]">
              {fullName}
            </h1>
          )}

          {hasText(jobTitle) && (
            <p className="text-gray-700 mt-1 text-[12px] break-words [overflow-wrap:anywhere]">
              {jobTitle}
            </p>
          )}

          <div className="mt-3 space-y-1 text-[11.5px] break-words [overflow-wrap:anywhere]">
  {hasText(personalInfo.email) && <p>✉ {personalInfo.email}</p>}

  {hasText(personalInfo.phone) && <p>☎ {personalInfo.phone}</p>}

  {hasText(personalInfo.location) && <p>⊙ {personalInfo.location}</p>}

  {hasText(personalInfo.website) && (
    <p className="break-all [overflow-wrap:anywhere]">
      🌐 {personalInfo.website}
    </p>
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

        <div className="grid grid-cols-2 gap-3 mt-2 min-w-0">
          {filledLinks.map((link: any, index: number) => {
            const platform = link.platform || link.label || "";
            const url = link.url || link.link || "";

            return (
              <div key={index} className={safeBlockClass}>
                {hasText(platform) && (
                  <h3 className="font-semibold text-[12.5px] break-words [overflow-wrap:anywhere]">
                    {platform}
                  </h3>
                )}

                {hasText(url) && (
                  <p className="text-[11.5px] mt-1 break-all [overflow-wrap:anywhere]">
                    {url}
                  </p>
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

        <p className="mt-2 leading-5 text-[12.5px] break-words [overflow-wrap:anywhere]">
          {summary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <section key="skills" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Technical Skills</h2>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 mt-3 min-w-0">
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
              <div key={index} className={safeBlockClass}>
                {hasText(title) && (
                  <h3 className="font-bold text-[12.5px] break-words [overflow-wrap:anywhere]">
                    {title}
                  </h3>
                )}

                {hasText(level) && (
                  <p className="text-[11.5px] mt-1 break-words [overflow-wrap:anywhere]">
                    {level}
                  </p>
                )}

                {items.length > 0 && (
                  <p className="text-[11.5px] mt-1 leading-4 break-words [overflow-wrap:anywhere]">
                    {items.join(", ")}
                  </p>
                )}

                {rating > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`w-4 h-1.5 ${
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

        <div className="space-y-3 mt-3 min-w-0">
          {filledEducation.map((edu: any, index: number) => {
            const school = edu.school || edu.university || "";
            const endDate = edu.endDate || edu.year || "";

            return (
              <div key={index} className={safeBlockClass}>
                <div className="flex justify-between gap-3 min-w-0">
                  <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                    {hasText(school) && (
                      <h3 className="font-bold text-[12px] break-words [overflow-wrap:anywhere]">
                        {school}
                      </h3>
                    )}

                    {hasText(edu.degree) && (
                      <p className="text-[12.5px] mt-1 break-words [overflow-wrap:anywhere]">
                        {edu.degree}
                      </p>
                    )}
                  </div>

                  {(hasText(edu.gpa) ||
                    hasText(edu.location) ||
                    hasText(edu.startDate) ||
                    hasText(endDate)) && (
                    <div className={metaClass}>
                      {hasText(edu.gpa) && <p>{edu.gpa}</p>}

                      {(hasText(edu.location) ||
                        hasText(edu.startDate) ||
                        hasText(endDate)) && (
                        <p>
                          {[
                            edu.location,
                            `${edu.startDate || ""}${
                              edu.startDate && endDate ? " - " : ""
                            }${endDate || ""}`,
                          ]
                            .filter((item) => hasText(item))
                            .join(" • ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {hasText(edu.description) && (
                  <p className="mt-2 text-[11.5px] leading-4 break-words [overflow-wrap:anywhere]">
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
      <section key="experience" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Professional Experience</h2>

        <div className="space-y-4 mt-3 min-w-0">
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
                <div className="flex justify-between gap-3 min-w-0">
                  <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                    {hasText(company) && (
                      <h3 className="font-bold text-[12px] break-words [overflow-wrap:anywhere]">
                        {company}
                      </h3>
                    )}

                    {hasText(position) && (
                      <p className="text-[12.5px] mt-1 break-words [overflow-wrap:anywhere]">
                        {position}
                      </p>
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
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-[11.5px] leading-4 break-words [overflow-wrap:anywhere]">
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
    if (filledProjects.length === 0) return null;

    return (
      <section key="projects" className={mainSectionClass}>
        <h2 className={mainHeadingClass}>Projects</h2>

        <div className="space-y-3 mt-3 min-w-0">
          {filledProjects.map((project: any, index: number) => {
            const projectName =
              project.name || project.title || project.project_name || "";

            return (
              <div key={index} className={safeBlockClass}>
                <div className="flex justify-between gap-3 min-w-0">
                  <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                    {hasText(projectName) && (
                      <h3 className="font-bold text-[12px] break-words [overflow-wrap:anywhere]">
                        {projectName}
                      </h3>
                    )}

                    {hasText(project.link) && (
                      <p className="text-[11.5px] mt-1 break-all [overflow-wrap:anywhere]">
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
                  <p className="mt-2 text-[11.5px] leading-4 break-words [overflow-wrap:anywhere]">
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

  const renderMainCustomSection = (sectionId: string) => {
    const section = nonTrainingCustomSections.find(
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

        <ul className="list-disc ml-4 mt-3 space-y-1 text-[11.5px] leading-4 break-words [overflow-wrap:anywhere]">
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
      <section key="certifications" className={sidebarSectionClass}>
        <h2 className={sidebarHeadingClass}>Certifications</h2>

        <div className="space-y-3 mt-3 min-w-0">
          {filledCertifications.map((cert: any, index: number) => {
            const certName =
              cert.certification_name ||
              cert.title ||
              cert.name ||
              "Certification";

            const date = cert.date_obtained || cert.date || cert.year || "";

            const provider =
              cert.issuer ||
              cert.company_name ||
              cert.provider ||
              cert.organization ||
              "";

            return (
              <div key={index} className={safeBlockClass}>
                {hasText(certName) && (
                  <h3 className="font-semibold text-[12.5px] break-words [overflow-wrap:anywhere]">
                    {certName}
                  </h3>
                )}

                {hasText(date) && (
                  <p className="text-[11.5px] mt-1 break-words [overflow-wrap:anywhere]">
                    {date}
                  </p>
                )}

                {hasText(provider) && (
                  <p className="text-[11.5px] mt-1 break-words [overflow-wrap:anywhere]">
                    {provider}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderTraining = (sectionId: string) => {
    const section = trainingSections.find(
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
      <section key={sectionId} className={sidebarSectionClass}>
        <h2 className={sidebarHeadingClass}>{section.title}</h2>

        <ul className="mt-3 space-y-2 text-[11.5px] leading-4 list-disc pl-4 break-words [overflow-wrap:anywhere]">
          {items.map((item: any, index: number) => (
            <li key={index}>
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderLanguages = () => {
    if (filledLanguages.length === 0) return null;

    return (
      <section key="languages" className={sidebarSectionClass}>
        <h2 className={sidebarHeadingClass}>Languages</h2>

        <div className="space-y-2 mt-3 min-w-0">
          {filledLanguages.map((lang: any, index: number) => {
            const languageName =
              lang.language_name || lang.language || lang.name || "Language";

            const level = lang.level || lang.proficiency || "";
            const progress = Math.min(ratingFromLevel(level) * 20, 100);

            return (
              <div key={index} className={safeBlockClass}>
                <div className="text-[11.5px] leading-4 min-w-0">
                  <p className="font-semibold break-words [overflow-wrap:anywhere]">
                    {languageName}
                  </p>

                  {hasText(level) && (
                    <p className="text-[10.5px] opacity-90 break-words [overflow-wrap:anywhere]">
                      {level}
                    </p>
                  )}
                </div>

                <div className="w-full h-1.5 bg-[#5d9a80] mt-1 rounded-sm overflow-hidden">
                  <div
                    className="h-1.5 bg-white rounded-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderAwards = () => {
    if (filledAwards.length === 0) return null;

    return (
      <section key="awards" className={sidebarSectionClass}>
        <h2 className={sidebarHeadingClass}>Awards & Recognition</h2>

        <div className="space-y-3 mt-3 min-w-0">
          {filledAwards.map((award: any, index: number) => {
            const awardTitle = award.title || award.name || "";

            return (
              <div key={index} className={safeBlockClass}>
                {hasText(awardTitle) && (
                  <h3 className="font-semibold text-[12.5px] break-words [overflow-wrap:anywhere]">
                    {awardTitle}
                  </h3>
                )}

                {hasText(award.date) && (
                  <p className="text-[11.5px] mt-1 break-words [overflow-wrap:anywhere]">
                    {award.date}
                  </p>
                )}

                {hasText(award.description) && (
                  <p className="text-[11.5px] mt-1 leading-4 break-words [overflow-wrap:anywhere]">
                    {award.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderInterests = () => {
    if (filledInterests.length === 0) return null;

    return (
      <section key="interests" className={sidebarSectionClass}>
        <h2 className={sidebarHeadingClass}>Interests</h2>

        <ul className="mt-3 space-y-2 text-[11.5px] leading-4 list-disc pl-4 break-words [overflow-wrap:anywhere]">
          {filledInterests.map((interest: any, index: number) => (
            <li key={index}>
              {typeof interest === "string"
                ? interest
                : interest.name || interest.title || "Interest"}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderMainSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderOnlinePresence();
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();

    return renderMainCustomSection(sectionId);
  };

  const renderSidebarSection = (sectionId: string) => {
    if (sectionId === "certifications") return renderCertifications();
    if (trainingSectionIds.includes(sectionId)) return renderTraining(sectionId);
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "awards") return renderAwards();
    if (sectionId === "interests") return renderInterests();

    return null;
  };

  return (
    <ResumePage>
      <div className="w-full h-[1123px] flex bg-[#f5f5f5] text-[#222] font-serif text-[12.5px] leading-[1.35] overflow-hidden">
        {/* LEFT SIDE */}
        <div className="basis-[72%] w-[72%] max-w-[72%] min-w-0 h-full p-5 overflow-hidden break-words [overflow-wrap:anywhere]">
          {renderHeader()}

          {mainOrder.map((sectionId: string) => renderMainSection(sectionId))}
        </div>

        {/* RIGHT SIDEBAR - permanently visible from top to bottom */}
        <aside className="basis-[28%] w-[28%] max-w-[28%] min-w-0 shrink-0 h-full bg-[#0f7a54] text-white p-4 flex flex-col overflow-hidden break-words [overflow-wrap:anywhere]">
          {finalSidebarOrder.map((sectionId: string) =>
            renderSidebarSection(sectionId)
          )}
        </aside>
      </div>
    </ResumePage>
  );
};

export default Template8;