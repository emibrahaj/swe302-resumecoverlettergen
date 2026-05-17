import React from "react";

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

const hasArrayItems = (arr: any[]) => {
  return (
    Array.isArray(arr) &&
    arr.some((item) => {
      if (!item) return false;

      if (typeof item === "string") {
        return item.trim() !== "";
      }

      if (typeof item === "object") {
        return Object.values(item).some((value: any) => {
          if (Array.isArray(value)) {
            return value.some((v) => String(v || "").trim() !== "");
          }

          return String(value || "").trim() !== "";
        });
      }

      return false;
    })
  );
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

const Template3: React.FC<Props> = ({ resumeData }) => {
  const {
    personalInfo = {},
    summary = "",
    skills: simpleSkills = [],
    technicalSkills = [],
    experience = [],
    education = [],
    links = [],
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

  const filledLinks = Array.isArray(links)
    ? links.filter((link: any) => hasAnyText(link?.platform, link?.url))
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

  const filledEducation = Array.isArray(education)
    ? education.filter((edu: any) =>
        hasAnyText(
          edu?.school,
          edu?.university,
          edu?.degree,
          edu?.location,
          edu?.startDate,
          edu?.endDate,
          edu?.year,
          edu?.description
        )
      )
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
          Number(skill?.rating) > 0 ||
          Number(skill?.progress) > 0
        );
      })
    : [];

  const filledProjects = Array.isArray(projects)
    ? projects.filter((project: any) =>
        hasAnyText(
          project?.name,
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
          ? section.items.filter((item: string) => hasText(item))
          : [];

        return hasText(section?.title) && items.length > 0;
      })
    : [];

  const hasHeader =
    hasText(fullName) ||
    hasText(jobTitle) ||
    hasText(personalInfo.email) ||
    hasText(personalInfo.phone) ||
    hasText(personalInfo.location) ||
    hasText(personalInfo.website) ||
    hasText(photoUrl);

  const cardClass = "bg-white rounded-2xl shadow-sm p-4 border mb-4";
  const headingClass = "text-cyan-700 font-bold text-[15px] mb-3";
  const itemTitleClass = "font-semibold text-[11px]";
  const mutedTextClass = "text-[9px] text-gray-500 mt-1";
  const bodyTextClass = "text-[10px] mt-2 leading-4 text-gray-800";

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "onlinePresence",
          "summary",
          "skills",
          "experience",
          "education",
          "projects",
          "languages",
          "certifications",
          ...filledCustomSections.map((section: any) => section.id),
        ];

  const renderOnlinePresence = () => {
    if (filledLinks.length === 0) return null;

    return (
      <div key="onlinePresence" className={cardClass}>
        <h2 className={headingClass}>Online Presence</h2>

        <div className="grid grid-cols-2 gap-4">
          {filledLinks.map((link: any, index: number) => (
            <div key={index}>
              {hasText(link.platform) && (
                <h3 className={itemTitleClass}>{link.platform}</h3>
              )}

              {hasText(link.url) && (
                <p className="text-[10px] text-gray-600 mt-1 break-words">
                  {link.url}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!hasText(summary)) return null;

    return (
      <div key="summary" className={cardClass}>
        <h2 className={headingClass}>Professional Summary</h2>

        <p className="text-[11px] leading-5 text-gray-800">
          {summary}
        </p>
      </div>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <div key="skills" className={cardClass}>
        <h2 className="text-cyan-700 font-bold text-[15px] mb-4">
          Technical Skills
        </h2>

        <div className="grid grid-cols-4 gap-4">
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

            const level =
              skillObj?.level || skillObj?.proficiency || "";

            const rating =
              typeof skillObj?.rating === "number"
                ? skillObj.rating
                : typeof skillObj?.progress === "number"
                  ? Math.round(skillObj.progress / 20)
                  : level === "Beginner"
                    ? 2
                    : level === "Intermediate"
                      ? 3
                      : level === "Advanced"
                        ? 4
                        : level === "Expert"
                          ? 5
                          : 0;

            const skillTitle =
              skillObj?.category || skillObj?.name || "";

            const skillItems = normalizeSkillItems(skillObj?.items);

            return (
              <div key={index}>
                {hasText(skillTitle) && (
                  <h3 className={itemTitleClass}>{skillTitle}</h3>
                )}

                {hasText(level) && (
                  <p className="text-[9px] text-gray-500 mt-1">
                    {level}
                  </p>
                )}

                {skillItems.length > 0 && (
                  <p className="text-[10px] mt-2 leading-4">
                    {skillItems.join(", ")}
                  </p>
                )}

                {Number(rating) > 0 && (
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, barIndex) => (
                      <div
                        key={barIndex}
                        className={`h-1.5 flex-1 rounded-full ${
                          barIndex < rating ? "bg-cyan-600" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (filledExperience.length === 0) return null;

    return (
      <div key="experience" className={cardClass}>
        <h2 className="text-cyan-700 font-bold text-[15px] mb-4">
          Professional Experience
        </h2>

        <div className="space-y-4">
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
                <div className="flex justify-between gap-4">
                  <div>
                    {hasText(company) && (
                      <h3 className={itemTitleClass}>{company}</h3>
                    )}

                    {hasText(position) && (
                      <p className={mutedTextClass}>{position}</p>
                    )}
                  </div>

                  {(hasText(exp.location) ||
                    hasText(exp.startDate) ||
                    hasText(exp.endDate)) && (
                    <div className="text-right text-[9px] text-gray-500 shrink-0">
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
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-[10px] leading-4">
                    {bullets.map((bullet: string, bulletIndex: number) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (filledEducation.length === 0) return null;

    return (
      <div key="education" className={cardClass}>
        <h2 className="text-cyan-700 font-bold text-[15px] mb-4">
          Education
        </h2>

        <div className="space-y-4">
          {filledEducation.map((edu: any, index: number) => {
            const school = edu.school || edu.university || "";
            const endDate = edu.endDate || edu.year || "";

            return (
              <div key={index}>
                <div className="flex justify-between gap-4">
                  <div>
                    {hasText(school) && (
                      <h3 className={itemTitleClass}>{school}</h3>
                    )}

                    {hasText(edu.degree) && (
                      <p className={mutedTextClass}>{edu.degree}</p>
                    )}
                  </div>

                  {(hasText(edu.location) ||
                    hasText(edu.startDate) ||
                    hasText(endDate)) && (
                    <div className="text-right text-[9px] text-gray-500 shrink-0">
                      {hasText(edu.location) && <p>{edu.location}</p>}

                      {(hasText(edu.startDate) || hasText(endDate)) && (
                        <p>
                          {hasText(edu.startDate) ? edu.startDate : ""}
                          {hasText(edu.startDate) && hasText(endDate)
                            ? " - "
                            : ""}
                          {hasText(endDate) ? endDate : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {hasText(edu.description) && (
                  <p className={bodyTextClass}>{edu.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (filledProjects.length === 0) return null;

    return (
      <div key="projects" className={cardClass}>
        <h2 className={headingClass}>Projects</h2>

        <div className="space-y-4">
          {filledProjects.map((project: any, index: number) => {
            const projectName = project.name || project.project_name || "";

            return (
              <div key={index}>
                <div className="flex justify-between gap-4">
                  <div>
                    {hasText(projectName) && (
                      <h3 className={itemTitleClass}>{projectName}</h3>
                    )}

                    {hasText(project.link) && (
                      <p className="text-[10px] text-cyan-700 mt-1 break-words">
                        {project.link}
                      </p>
                    )}
                  </div>

                  {(hasText(project.startDate) || hasText(project.endDate)) && (
                    <div className="text-right text-[9px] text-gray-500 shrink-0">
                      <p>
                        {hasText(project.startDate) ? project.startDate : ""}
                        {hasText(project.startDate) && hasText(project.endDate)
                          ? " - "
                          : ""}
                        {hasText(project.endDate) ? project.endDate : ""}
                      </p>
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
      </div>
    );
  };

  const renderLanguages = () => {
    if (filledLanguages.length === 0) return null;

    return (
      <div key="languages" className={cardClass}>
        <h2 className={headingClass}>Languages</h2>

        <div className="grid grid-cols-2 gap-3">
          {filledLanguages.map((language: any, index: number) => {
            const languageName = language.language_name || language.name || "";
            const proficiency = language.proficiency || language.level || "";

            return (
              <div key={index}>
                {hasText(languageName) && (
                  <h3 className={itemTitleClass}>{languageName}</h3>
                )}

                {hasText(proficiency) && (
                  <p className={mutedTextClass}>{proficiency}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (filledCertifications.length === 0) return null;

    return (
      <div key="certifications" className={cardClass}>
        <h2 className={headingClass}>Certifications</h2>

        <div className="space-y-4">
          {filledCertifications.map((cert: any, index: number) => {
            const name = cert.certification_name || cert.name || "";
            const issuer = cert.issuer || cert.company_name || "";
            const date = cert.date_obtained || cert.date || "";

            return (
              <div key={index}>
                {hasText(name) && (
                  <h3 className={itemTitleClass}>{name}</h3>
                )}

                {(hasText(issuer) || hasText(date)) && (
                  <p className={mutedTextClass}>
                    {[issuer, date].filter((item) => hasText(item)).join(" • ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCustomSection = (sectionId: string) => {
    const section = filledCustomSections.find(
      (customSection: any) => customSection.id === sectionId
    );

    if (!section) return null;

    const items = Array.isArray(section.items)
      ? section.items.filter((item: string) => hasText(item))
      : [];

    if (items.length === 0) return null;

    return (
      <div key={sectionId} className={cardClass}>
        <h2 className={headingClass}>{section.title}</h2>

        <ul className="list-disc ml-4 space-y-1 text-[10px] leading-4">
          {items.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderOrderedSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderOnlinePresence();
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "projects") return renderProjects();
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "certifications") return renderCertifications();

    return renderCustomSection(sectionId);
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-4 text-[#222] font-sans">
      {/* HEADER CARD */}
      {hasHeader && (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center mb-4 border">
          {hasText(photoUrl) && (
            <img
              src={photoUrl}
              alt="profile"
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            {hasText(fullName) && (
              <h1 className="text-[24px] font-bold leading-tight break-words">
                {fullName}
              </h1>
            )}

            {hasText(jobTitle) && (
              <p className="text-gray-600 mt-1 text-[13px] break-words">
                {jobTitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-gray-700">
              {hasText(personalInfo.email) && <span>{personalInfo.email}</span>}
              {hasText(personalInfo.phone) && <span>{personalInfo.phone}</span>}
              {hasText(personalInfo.location) && (
                <span>{personalInfo.location}</span>
              )}
              {hasText(personalInfo.website) && (
                <span className="break-all">{personalInfo.website}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDERED BODY SECTIONS */}
      {bodyOrder.map((sectionId: string) => renderOrderedSection(sectionId))}
    </div>
  );
};

export default Template3;