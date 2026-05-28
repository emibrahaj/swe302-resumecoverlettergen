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

const text = (...values: any[]) => {
  for (const value of values) {
    if (hasText(value)) return String(value).trim();
  }

  return "";
};

const asArray = (value: any): any[] => {
  return Array.isArray(value) ? value : [];
};

const normalizeSkillItems = (items: any) => {
  if (Array.isArray(items)) {
    return items.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (hasText(items)) {
    return String(items)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const uniqueOrder = (items: string[]) => {
  return items.filter((item, index) => item && items.indexOf(item) === index);
};

const ratingFromLevel = (level: string) => {
  const normalized = String(level || "").toLowerCase();

  if (normalized.includes("native")) return 5;
  if (normalized.includes("fluent")) return 4.5;
  if (normalized.includes("expert")) return 5;
  if (normalized.includes("advanced")) return 4;
  if (normalized.includes("professional")) return 4;
  if (normalized.includes("intermediate")) return 3;
  if (normalized.includes("conversational")) return 3;
  if (normalized.includes("basic")) return 2;
  if (normalized.includes("beginner")) return 1.5;

  return 3;
};

const Template4: React.FC<Props> = ({ resumeData, styleConfig }) => {
  const {
    personalInfo = {},
    summary = "",
    skills = [],
    technicalSkills = [],
    education = [],
    experience = [],
    projects = [],
    languages = [],
    certifications = [],
    awards = [],
    interests = [],
    hobbies = [],
    conferences = [],
    courses = [],
    other = [],
    customSections = [],
    links = [],
    profiles = [],
  } = resumeData || {};

  const primaryColor =
    styleConfig?.primaryColor ||
    resumeData?.accentColor ||
    "#088395";

  const fontFamily =
    styleConfig?.fontFamily ||
    resumeData?.fontFamily ||
    "Georgia, serif";

  const fullName = text(personalInfo.fullName, personalInfo.name);

  const jobTitle = text(
    personalInfo.jobTitle,
    personalInfo.title,
    personalInfo.professionalTitle
  );

  const photoUrl = text(
    personalInfo.photoUrl,
    personalInfo.photo,
    resumeData?.photoUrl
  );

  const website = text(personalInfo.website);
  const github = text(personalInfo.github);
  const linkedin = text(personalInfo.linkedin);

 const onlineSource =
  asArray(links).length > 0
    ? asArray(links)
    : asArray(profiles).length > 0
      ? asArray(profiles)
      : asArray(personalInfo.links);

const allProfiles = onlineSource
  .filter((profile: any) =>
    text(
      profile?.platform,
      profile?.label,
      profile?.name,
      profile?.url,
      profile?.link
    )
  )
  .filter((profile: any, index: number, arr: any[]) => {
    const platform = text(profile?.platform, profile?.label, profile?.name);
    const url = text(profile?.url, profile?.link, profile?.value);

    return (
      arr.findIndex((item: any) => {
        const itemPlatform = text(item?.platform, item?.label, item?.name);
        const itemUrl = text(item?.url, item?.link, item?.value);

        return itemPlatform === platform && itemUrl === url;
      }) === index
    );
  });

  const rawSkills =
    asArray(technicalSkills).length > 0
      ? asArray(technicalSkills)
      : asArray(skills);

  const filledSkills = rawSkills.filter((skill: any) => {
    if (typeof skill === "string") return hasText(skill);

    const items = normalizeSkillItems(skill?.items);

    return (
      text(skill?.category, skill?.name, skill?.skill_name) ||
      text(skill?.level, skill?.proficiency) ||
      items.length > 0 ||
      Number(skill?.rating) > 0
    );
  });

  const filledEducation = asArray(education).filter((edu: any) =>
    text(
      edu?.degree,
      edu?.school,
      edu?.university,
      edu?.institution,
      edu?.gpa,
      edu?.location,
      edu?.startDate,
      edu?.start_date,
      edu?.endDate,
      edu?.end_date,
      edu?.year,
      edu?.description
    )
  );

  const filledExperience = asArray(experience).filter((exp: any) => {
    const bullets =
      asArray(exp?.bullets).length > 0
        ? asArray(exp?.bullets)
        : text(exp?.description)
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);

    return (
      text(
        exp?.position,
        exp?.title,
        exp?.role,
        exp?.company,
        exp?.companyName,
        exp?.company_name,
        exp?.location,
        exp?.startDate,
        exp?.start_date,
        exp?.endDate,
        exp?.end_date
      ) || bullets.length > 0
    );
  });

  const filledProjects = asArray(projects).filter((project: any) =>
    text(
      project?.name,
      project?.title,
      project?.project_name,
      project?.role,
      project?.startDate,
      project?.start_date,
      project?.endDate,
      project?.end_date,
      project?.description,
      project?.link,
      project?.url
    )
  );

  const filledLanguages = asArray(languages).filter((language: any) => {
    if (typeof language === "string") return hasText(language);

    return text(
      language?.language_name,
      language?.language,
      language?.name,
      language?.proficiency,
      language?.level
    );
  });

  const filledCertifications = asArray(certifications).filter((cert: any) =>
    text(
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
  );

  const filledAwards = asArray(awards).filter((award: any) => {
    if (typeof award === "string") return hasText(award);

    return text(award?.title, award?.name, award?.date, award?.description);
  });

  const filledInterests = asArray(interests).filter((interest: any) => {
    if (typeof interest === "string") return hasText(interest);

    return text(interest?.title, interest?.name, interest?.description);
  });

  const filledHobbies = asArray(hobbies).filter((hobby: any) => {
    if (typeof hobby === "string") return hasText(hobby);

    return text(hobby?.title, hobby?.name, hobby?.description);
  });

  const filledConferences = asArray(conferences).filter((conference: any) =>
    text(
      conference?.title,
      conference?.name,
      conference?.organizer,
      conference?.location,
      conference?.date,
      conference?.description
    )
  );

  const filledCourses = asArray(courses).filter((course: any) => {
    if (typeof course === "string") return hasText(course);

    return text(course?.title, course?.name, course?.provider, course?.date);
  });

  const filledOther = asArray(other).filter((item: any) => {
    if (typeof item === "string") return hasText(item);

    return text(item?.title, item?.name, item?.description);
  });

  const filledCustomSections = asArray(customSections).filter((section: any) => {
    const items = asArray(section?.items).filter((item: any) => {
      if (typeof item === "string") return hasText(item);

      if (typeof item === "object" && item !== null) {
        return Object.values(item).some((value: any) =>
          hasText(String(value || ""))
        );
      }

      return false;
    });

    return hasText(section?.title) && items.length > 0;
  });

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
          "languages",
          "certifications",
          "awards",
          "interests",
          "hobbies",
          "conferences",
          "courses",
          "other",
          ...filledCustomSections.map((section: any) => section.id),
        ];

  const customSectionIds = filledCustomSections.map((section: any) => section.id);

  const orderedSections = uniqueOrder([
    ...bodyOrder,
    ...customSectionIds.filter((id: string) => !bodyOrder.includes(id)),
  ]);

  const wrapClass = "min-w-0 max-w-full break-words [overflow-wrap:anywhere]";
  const sectionClass = `mb-6 w-full max-w-full overflow-hidden ${wrapClass}`;

  const headingClass =
    "font-bold text-[16px] uppercase border-b-2 pb-1 mb-4 break-words";

  const headingStyle = {
    color: primaryColor,
    borderColor: primaryColor,
  } as React.CSSProperties;

  const itemTitleClass = `text-[12px] font-bold ${wrapClass}`;
  const itemSubClass = `text-[11.5px] mt-1 text-gray-600 ${wrapClass}`;
  const bodyTextClass = `text-[11.5px] mt-2 leading-4 whitespace-pre-wrap ${wrapClass}`;

  const renderHeader = () => {
    const hasHeader =
      fullName ||
      jobTitle ||
      photoUrl ||
      text(
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        website,
        github,
        linkedin
      );

    if (!hasHeader) return null;

    return (
      <header className="flex items-start justify-between gap-5 border-b-2 border-gray-300 pb-5 mb-6">
        <div className={`flex-1 ${wrapClass}`}>
          {fullName && (
            <h1
              className={`text-[30px] font-bold leading-tight uppercase ${wrapClass}`}
              style={{ color: primaryColor }}
            >
              {fullName}
            </h1>
          )}

          {jobTitle && (
            <p className={`text-[14px] mt-1 text-gray-700 ${wrapClass}`}>
              {jobTitle}
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4 text-[11.5px] leading-4">
            {personalInfo.email && (
              <p className={wrapClass}>✉ {personalInfo.email}</p>
            )}

            {personalInfo.phone && (
              <p className={wrapClass}>☎ {personalInfo.phone}</p>
            )}

            {personalInfo.location && (
              <p className={wrapClass}>⌾ {personalInfo.location}</p>
            )}

            {website && <p className={wrapClass}>⊕ {website}</p>}

            {github && <p className={wrapClass}>⌘ {github}</p>}

            {linkedin && <p className={wrapClass}>▣ {linkedin}</p>}
          </div>
        </div>

        {photoUrl && (
          <img
            src={photoUrl}
            alt="profile"
            className="w-[105px] h-[105px] object-cover rounded-sm shrink-0"
          />
        )}
      </header>
    );
  };

  const renderOnlinePresence = () => {
    if (allProfiles.length === 0) return null;

    return (
      <section key="onlinePresence" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>
          Online Presence
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {allProfiles.map((profile: any, index: number) => {
            const platform = text(
              profile.platform,
              profile.label,
              profile.name,
              "Profile"
            );

            const url = text(profile.url, profile.link, profile.value);

            return (
              <div key={index} className={wrapClass}>
                {platform && <h3 className={itemTitleClass}>{platform}</h3>}

                {url && (
                  <p
                    className={`text-[11.5px] mt-1 leading-4 ${wrapClass}`}
                    style={{ color: primaryColor }}
                  >
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
      <section key="summary" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>
          Professional Summary
        </h2>

        <p className={`text-[12.5px] leading-5 whitespace-pre-wrap ${wrapClass}`}>
          {summary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <section key="skills" className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>
          Technical Skills
        </h2>

        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-5 w-full max-w-full overflow-hidden">
          {filledSkills.map((skill: any, index: number) => {
            if (typeof skill === "string") {
              return (
                <div key={index} className={wrapClass}>
                  <h3 className={itemTitleClass}>{skill}</h3>
                </div>
              );
            }

            const title = text(skill.category, skill.name, skill.skill_name);
            const level = text(skill.level, skill.proficiency);
            const items = normalizeSkillItems(skill.items);

            const rating =
              Number(skill.rating) > 0
                ? Number(skill.rating)
                : ratingFromLevel(level);

            return (
              <div key={index} className={wrapClass}>
                {title && <h3 className={itemTitleClass}>{title}</h3>}

                {level && <p className={itemSubClass}>{level}</p>}

                {items.length > 0 && (
                  <p className={`text-[11.5px] mt-1 leading-4 ${wrapClass}`}>
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
                            ? { backgroundColor: primaryColor }
                            : { border: `1px solid ${primaryColor}` }
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
        <h2 className={headingClass} style={headingStyle}>
          Education
        </h2>

        <div className="space-y-5 w-full max-w-full overflow-hidden">
          {filledEducation.map((edu: any, index: number) => {
            const school = text(edu.school, edu.university, edu.institution);
            const degree = text(edu.degree);
            const endDate = text(edu.endDate, edu.end_date, edu.year);

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between items-start gap-4 min-w-0 overflow-hidden">
                  <div className={`min-w-0 flex-1 overflow-hidden ${wrapClass}`}>
                    <div className="flex gap-2 flex-wrap items-center min-w-0">
                      {degree && <h3 className="text-[12px] break-words">{degree}</h3>}

                      {school && (
                        <span className="text-[12px] font-bold break-words">
                          {school}
                        </span>
                      )}
                    </div>

                    {(text(edu.gpa) || text(edu.location)) && (
                      <p className="text-[11.5px] mt-2 text-gray-700 break-words">
                        {[text(edu.gpa), text(edu.location)]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>

                  {(text(edu.startDate, edu.start_date) || endDate) && (
                    <div className="text-[11.5px] shrink-0 text-right max-w-[150px] break-words">
                      {text(edu.startDate, edu.start_date)}
                      {text(edu.startDate, edu.start_date) && endDate ? " – " : ""}
                      {endDate}
                    </div>
                  )}
                </div>

                {text(edu.description) && (
                  <p className={bodyTextClass}>{text(edu.description)}</p>
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
        <h2 className={headingClass} style={headingStyle}>
          Professional Experience
        </h2>

        <div className="space-y-6 w-full max-w-full overflow-hidden">
          {filledExperience.map((exp: any, index: number) => {
            const position = text(exp.position, exp.title, exp.role);
            const company = text(exp.company, exp.companyName, exp.company_name);

            const startDate = text(exp.startDate, exp.start_date);
            const endDate = text(exp.endDate, exp.end_date);

            const bullets =
              asArray(exp.bullets).length > 0
                ? asArray(exp.bullets).filter((bullet: any) =>
                    hasText(String(bullet))
                  )
                : text(exp.description)
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean);

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between items-start gap-4 min-w-0 overflow-hidden">
                  <div className="flex gap-2 flex-wrap items-center min-w-0 flex-1 overflow-hidden">
                    {position && (
                      <h3 className="text-[12px] break-words">{position}</h3>
                    )}

                    {company && (
                      <span className="text-[12px] font-bold break-words">
                        {company}
                      </span>
                    )}
                  </div>

                  {(startDate || endDate) && (
                    <div className="text-right text-[11.5px] shrink-0 max-w-[150px] break-words">
                      {startDate}
                      {startDate && endDate ? " – " : ""}
                      {endDate}
                    </div>
                  )}
                </div>

                {text(exp.location) && (
                  <p className="text-[11.5px] mt-1 text-gray-600 break-words">
                    {text(exp.location)}
                  </p>
                )}

                {bullets.length > 0 && (
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-[11.5px] leading-4">
                    {bullets.map((bullet: any, i: number) => (
                      <li key={i} className={wrapClass}>
                        {String(bullet)}
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
        <h2 className={headingClass} style={headingStyle}>
          Projects
        </h2>

        <div className="space-y-5 w-full max-w-full overflow-hidden">
          {filledProjects.map((project: any, index: number) => {
            const projectName = text(
              project.name,
              project.title,
              project.project_name
            );

            const startDate = text(project.startDate, project.start_date);
            const endDate = text(project.endDate, project.end_date);

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between items-start gap-4 min-w-0 overflow-hidden">
                  <div className={`min-w-0 flex-1 overflow-hidden ${wrapClass}`}>
                    {projectName && <h3 className={itemTitleClass}>{projectName}</h3>}

                    {text(project.link, project.url) && (
                      <p
                        className={`text-[11.5px] mt-1 ${wrapClass}`}
                        style={{ color: primaryColor }}
                      >
                        {text(project.link, project.url)}
                      </p>
                    )}
                  </div>

                  {(startDate || endDate) && (
                    <div className="text-[11.5px] shrink-0 text-right max-w-[150px] break-words">
                      {startDate}
                      {startDate && endDate ? " – " : ""}
                      {endDate}
                    </div>
                  )}
                </div>

                {text(project.description) && (
                  <p className={bodyTextClass}>{text(project.description)}</p>
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
        <h2 className={headingClass} style={headingStyle}>
          Languages
        </h2>

        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 w-full max-w-full overflow-hidden">
          {filledLanguages.map((language: any, index: number) => {
            const languageName =
              typeof language === "string"
                ? language
                : text(language.language_name, language.language, language.name);

            const proficiency =
              typeof language === "string"
                ? ""
                : text(language.proficiency, language.level);

            return (
              <div key={index} className={wrapClass}>
                {languageName && <h3 className={itemTitleClass}>{languageName}</h3>}
                {proficiency && <p className={itemSubClass}>{proficiency}</p>}
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
        <h2 className={headingClass} style={headingStyle}>
          Certifications
        </h2>

        <div className="space-y-4 w-full max-w-full overflow-hidden">
          {filledCertifications.map((cert: any, index: number) => {
            const certName = text(cert.certification_name, cert.title, cert.name);
            const issuer = text(
              cert.issuer,
              cert.company_name,
              cert.provider,
              cert.organization
            );
            const date = text(cert.date_obtained, cert.date, cert.year);

            return (
              <div key={index} className={wrapClass}>
                {certName && <h3 className={itemTitleClass}>{certName}</h3>}

                {(issuer || date) && (
                  <p className={itemSubClass}>
                    {[issuer, date].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderListSection = (
    sectionId: string,
    title: string,
    items: any[]
  ) => {
    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={sectionClass}>
        <h2 className={headingClass} style={headingStyle}>
          {title}
        </h2>

        <div className="space-y-3 w-full max-w-full overflow-hidden">
          {items.map((item: any, index: number) => {
            if (typeof item === "string") {
              return (
                <p key={index} className={`text-[11.5px] leading-4 ${wrapClass}`}>
                  {item}
                </p>
              );
            }

            const itemTitle = text(item.title, item.name);
            const subtitle = text(
              item.subtitle,
              item.organization,
              item.company,
              item.issuer
            );
            const description = text(item.description, item.details);
            const date = text(item.date, item.year);

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between gap-3 min-w-0">
                  <div className={`flex-1 ${wrapClass}`}>
                    {itemTitle && (
                      <h3 className={itemTitleClass}>{itemTitle}</h3>
                    )}

                    {subtitle && <p className={itemSubClass}>{subtitle}</p>}
                  </div>

                  {date && (
                    <span className="text-[11.5px] shrink-0 max-w-[140px] text-right break-words">
                      {date}
                    </span>
                  )}
                </div>

                {description && <p className={bodyTextClass}>{description}</p>}
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

    return renderListSection(sectionId, section.title, asArray(section.items));
  };

  const renderOrderedSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderOnlinePresence();
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "certifications") return renderCertifications();
    if (sectionId === "awards") {
      return renderListSection("awards", "Awards & Recognition", filledAwards);
    }
    if (sectionId === "interests") {
      return renderListSection("interests", "Interests", filledInterests);
    }
    if (sectionId === "hobbies") {
      return renderListSection("hobbies", "Hobbies", filledHobbies);
    }
    if (sectionId === "conferences") {
      return renderListSection("conferences", "Conferences", filledConferences);
    }
    if (sectionId === "courses") {
      return renderListSection("courses", "Courses", filledCourses);
    }
    if (sectionId === "other") {
      return renderListSection("other", "Other", filledOther);
    }

    return renderCustomSection(sectionId);
  };

  return (
    <ResumePage>
      <div
        className="w-full max-w-full min-h-full overflow-hidden box-border bg-[#f5f5f5] text-[#1d1d1d] p-5 text-[12.5px] leading-[1.4]"
        style={{ fontFamily }}
      >
        {renderHeader()}

        {orderedSections.map((sectionId: string) => (
          <React.Fragment key={sectionId}>
            {renderOrderedSection(sectionId)}
          </React.Fragment>
        ))}
      </div>
    </ResumePage>
  );
};

export default Template4;