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

const Template11: React.FC<Props> = ({ resumeData, styleConfig }) => {
  const {
    personalInfo = {},
    summary = "",
    links = [],
    profiles = [],
    skills = [],
    technicalSkills = [],
    experience = [],
    education = [],
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
  } = resumeData || {};

  const primaryColor =
    styleConfig?.primaryColor ||
    resumeData?.accentColor ||
    "#5d16b5";

  const paleSidebar = "#ded0ec";
  const summaryBg = "#eadff3";

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
        exp?.company,
        exp?.company_name,
        exp?.companyName,
        exp?.position,
        exp?.role,
        exp?.title,
        exp?.location,
        exp?.startDate,
        exp?.start_date,
        exp?.endDate,
        exp?.end_date
      ) || bullets.length > 0
    );
  });

  const filledEducation = asArray(education).filter((edu: any) =>
    text(
      edu?.school,
      edu?.university,
      edu?.institution,
      edu?.degree,
      edu?.location,
      edu?.startDate,
      edu?.start_date,
      edu?.endDate,
      edu?.end_date,
      edu?.year,
      edu?.description
    )
  );

  const filledProjects = asArray(projects).filter((project: any) =>
    text(
      project?.title,
      project?.name,
      project?.project_name,
      project?.role,
      project?.link,
      project?.url,
      project?.description,
      project?.startDate,
      project?.start_date,
      project?.endDate,
      project?.end_date
    )
  );

  const filledLanguages = asArray(languages).filter((lang: any) => {
    if (typeof lang === "string") return hasText(lang);

    return text(
      lang?.language_name,
      lang?.language,
      lang?.name,
      lang?.proficiency,
      lang?.level
    );
  });

  const filledCertifications = asArray(certifications).filter((cert: any) =>
    text(
      cert?.title,
      cert?.certification_name,
      cert?.name,
      cert?.issuer,
      cert?.provider,
      cert?.company_name,
      cert?.organization,
      cert?.date,
      cert?.date_obtained,
      cert?.year
    )
  );

  const filledAwards = asArray(awards).filter((award: any) =>
    text(award?.title, award?.name, award?.date, award?.description)
  );

  const filledInterests = asArray(interests).filter((interest: any) => {
    if (typeof interest === "string") return hasText(interest);
    return text(interest?.name, interest?.title);
  });

  const filledHobbies = asArray(hobbies).filter((hobby: any) => {
    if (typeof hobby === "string") return hasText(hobby);
    return text(hobby?.name, hobby?.title);
  });

  const filledConferences = asArray(conferences).filter((conference: any) =>
    text(
      conference?.title,
      conference?.name,
      conference?.organizer,
      conference?.location,
      conference?.date
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

  const trainingSections = filledCustomSections.filter((section: any) => {
    const title = String(section?.title || "").trim().toLowerCase();
    return title.includes("training");
  });

  const publicationSections = filledCustomSections.filter((section: any) => {
    const title = String(section?.title || "").trim().toLowerCase();
    return title.includes("publication") || title.includes("talk");
  });

  const trainingSectionIds = trainingSections.map((section: any) => section.id);

  const publicationSectionIds = publicationSections.map(
    (section: any) => section.id
  );

  const sidebarCustomIds = [...trainingSectionIds, ...publicationSectionIds];

  const nonSidebarCustomSections = filledCustomSections.filter(
    (section: any) => !sidebarCustomIds.includes(section.id)
  );

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "onlinePresence",
          "skills",
          "education",
          "experience",
          "projects",
          ...nonSidebarCustomSections.map((section: any) => section.id),
          "certifications",
          ...trainingSectionIds,
          "languages",
          "awards",
          "interests",
          ...publicationSectionIds,
        ];

  /**
   * IMPORTANT:
   * Skills and Online Presence stay in the MAIN area for Template 11.
   * Sidebar only gets certs/languages/awards/interests/custom sidebar sections.
   */
  const forcedSidebarIds = [
    "certifications",
    "languages",
    "awards",
    "interests",
    "hobbies",
    "conferences",
    "courses",
    "other",
    ...sidebarCustomIds,
  ];

  const mainOrder = bodyOrder.filter(
    (sectionId: string) => !forcedSidebarIds.includes(sectionId)
  );

  const sidebarOrderFromBody = bodyOrder.filter((sectionId: string) =>
    forcedSidebarIds.includes(sectionId)
  );

  const missingSidebarIds = forcedSidebarIds.filter(
    (sectionId: string) => !sidebarOrderFromBody.includes(sectionId)
  );

  const sidebarOrder = uniqueOrder([
    ...sidebarOrderFromBody,
    ...missingSidebarIds,
  ]);

  const wrapClass = "min-w-0 max-w-full break-words [overflow-wrap:anywhere]";

  const MainTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className={`text-[13px] font-bold border-b pb-[3px] mb-2 ${wrapClass}`}
      style={{ color: primaryColor, borderColor: primaryColor }}
    >
      {children}
    </h2>
  );

  const SidebarTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className={`text-[12px] font-bold border-b pb-[3px] mb-2 ${wrapClass}`}
      style={{ color: primaryColor, borderColor: primaryColor }}
    >
      {children}
    </h2>
  );

  const RatingDots = ({ rating }: { rating: number }) => (
    <div className="flex gap-[5px] mt-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className="inline-block w-[7px] h-[7px] rounded-full border"
          style={{
            borderColor: primaryColor,
            backgroundColor: dot <= rating ? primaryColor : "transparent",
          }}
        />
      ))}
    </div>
  );

  const renderHeader = () => {
    const hasHeader =
      fullName ||
      jobTitle ||
      photoUrl ||
      text(
        personalInfo.location,
        personalInfo.phone,
        personalInfo.email,
        website,
        github,
        linkedin
      );

    if (!hasHeader) return null;

    return (
      <div
        className="p-4 text-white min-w-0 overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {photoUrl && (
          <img
            src={photoUrl}
            alt="profile"
            className="w-[96px] h-[96px] object-cover mb-3"
          />
        )}

        {fullName && (
          <h1 className={`text-[20px] font-bold leading-tight ${wrapClass}`}>
            {fullName}
          </h1>
        )}

        {jobTitle && (
          <p className={`text-[10px] leading-4 mt-1 ${wrapClass}`}>
            {jobTitle}
          </p>
        )}

        <div className={`mt-3 space-y-1 text-[9.5px] leading-4 ${wrapClass}`}>
          {personalInfo.email && <p>✉ {personalInfo.email}</p>}
          {personalInfo.phone && <p>☎ {personalInfo.phone}</p>}
          {personalInfo.location && <p>⌾ {personalInfo.location}</p>}
          {linkedin && <p>▣ {linkedin}</p>}
          {website && <p>⊕ {website}</p>}
          {github && <p>⌘ {github}</p>}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!hasText(summary)) return null;

    return (
      <section
        key="summary"
        className={`px-4 py-3 mb-3 ${wrapClass}`}
        style={{ backgroundColor: summaryBg }}
      >
        <p className={`text-[10.5px] leading-5 whitespace-pre-wrap ${wrapClass}`}>
          {summary}
        </p>
      </section>
    );
  };

  const renderProfiles = () => {
    if (allProfiles.length === 0) return null;

    return (
      <section key="onlinePresence" className={`mb-3 ${wrapClass}`}>
        <MainTitle>Online Presence</MainTitle>

        <div className="grid grid-cols-2 gap-x-7 gap-y-1.5">
          {allProfiles.map((profile: any, index: number) => {
            const label = text(
              profile.platform,
              profile.name,
              profile.username,
              profile.label,
              "Profile"
            );

            const url = text(profile.url, profile.link, profile.value);

            return (
              <div key={index} className={wrapClass}>
                {label && (
                  <p className="font-semibold text-[10px] leading-4">
                    {label}
                  </p>
                )}
                {url && <p className={`text-[9.5px] leading-4 ${wrapClass}`}>{url}</p>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <section key="skills" className={`mb-3 ${wrapClass}`}>
        <MainTitle>Technical Skills</MainTitle>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {filledSkills.map((skill: any, index: number) => {
            if (typeof skill === "string") {
              return (
                <div key={index} className={wrapClass}>
                  <p className="font-semibold text-[10px] leading-4">{skill}</p>
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
                {title && (
                  <p className="font-semibold text-[10px] leading-4">
                    {title}
                  </p>
                )}

                {level && <p className="text-[9.5px] leading-4">{level}</p>}

                {items.length > 0 && (
                  <p className={`text-[9.5px] leading-4 ${wrapClass}`}>
                    {items.join(", ")}
                  </p>
                )}

                <RatingDots rating={rating} />
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
      <section key="education" className={`mb-3 ${wrapClass}`}>
        <MainTitle>Education</MainTitle>

        <div className="space-y-2">
          {filledEducation.map((edu: any, index: number) => {
            const school = text(edu.school, edu.university, edu.institution);
            const degree = text(edu.degree);

            const dates = [
              text(edu.startDate, edu.start_date),
              text(edu.endDate, edu.end_date, edu.year),
            ]
              .filter(Boolean)
              .join(" - ");

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between gap-4 min-w-0">
                  <div className={`flex-1 ${wrapClass}`}>
                    {school && (
                      <p className="font-bold text-[10.5px] leading-4">
                        {school}
                      </p>
                    )}

                    {degree && (
                      <p className="text-[9.5px] leading-4">{degree}</p>
                    )}
                  </div>

                  {(dates || text(edu.location)) && (
                    <div className="text-right text-[9.5px] leading-4 shrink-0 max-w-[180px] break-words">
                      {degree && <p>{degree}</p>}
                      {text(edu.location) && <p>{text(edu.location)}</p>}
                      {dates && <p>{dates}</p>}
                    </div>
                  )}
                </div>

                {text(edu.description) && (
                  <p className={`text-[9.5px] leading-4 mt-1 ${wrapClass}`}>
                    {text(edu.description)}
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
      <section key="experience" className={`mb-3 ${wrapClass}`}>
        <MainTitle>Professional Experience</MainTitle>

        <div className="space-y-3">
          {filledExperience.map((exp: any, index: number) => {
            const company = text(exp.company, exp.company_name, exp.companyName);
            const position = text(exp.position, exp.role, exp.title);

            const dates = [
              text(exp.startDate, exp.start_date),
              text(exp.endDate, exp.end_date),
            ]
              .filter(Boolean)
              .join(" - ");

            const bullets =
              asArray(exp.bullets).length > 0
                ? asArray(exp.bullets)
                : text(exp.description)
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean);

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between gap-4 min-w-0">
                  <div className={`flex-1 ${wrapClass}`}>
                    {company && (
                      <p className="font-bold text-[10.5px] leading-4">
                        {company}
                      </p>
                    )}

                    {position && (
                      <p className="text-[9.5px] leading-4">{position}</p>
                    )}
                  </div>

                  {(dates || text(exp.location)) && (
                    <div className="text-right text-[9.5px] leading-4 shrink-0 max-w-[180px] break-words">
                      {text(exp.location) && <p>{text(exp.location)}</p>}
                      {dates && <p>{dates}</p>}
                    </div>
                  )}
                </div>

                {bullets.length > 0 && (
                  <ul className="list-disc ml-5 mt-1 space-y-1 text-[9.5px] leading-4">
                    {bullets.map((bullet: any, bulletIndex: number) => (
                      <li key={bulletIndex} className={wrapClass}>
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
      <section key="projects" className={`mb-3 ${wrapClass}`}>
        <MainTitle>Projects</MainTitle>

        <div className="space-y-3">
          {filledProjects.map((project: any, index: number) => {
            const projectName = text(
              project.title,
              project.name,
              project.project_name
            );

            const dates = [
              text(project.startDate, project.start_date),
              text(project.endDate, project.end_date),
            ]
              .filter(Boolean)
              .join(" - ");

            return (
              <div key={index} className={wrapClass}>
                <div className="flex justify-between gap-4 min-w-0">
                  <div className={`flex-1 ${wrapClass}`}>
                    {projectName && (
                      <p className="font-bold text-[10.5px] leading-4">
                        {projectName}
                      </p>
                    )}

                    {text(project.role) && (
                      <p className="text-[9.5px] leading-4">
                        {text(project.role)}
                      </p>
                    )}

                    {text(project.link, project.url) && (
                      <p className={`text-[9.5px] leading-4 ${wrapClass}`}>
                        {text(project.link, project.url)}
                      </p>
                    )}
                  </div>

                  {dates && (
                    <div className="text-right text-[9.5px] leading-4 shrink-0 max-w-[150px] break-words">
                      {dates}
                    </div>
                  )}
                </div>

                {text(project.description) && (
                  <p className={`text-[9.5px] leading-4 mt-1 ${wrapClass}`}>
                    {text(project.description)}
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
      <section key="certifications" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle>Certifications</SidebarTitle>

        <div className="space-y-2">
          {filledCertifications.map((cert: any, index: number) => {
            const title = text(cert.title, cert.certification_name, cert.name);

            const issuer = text(
              cert.issuer,
              cert.provider,
              cert.company_name,
              cert.organization,
              cert.platform
            );

            const date = text(cert.date, cert.date_obtained, cert.year);

            return (
              <div key={index} className={wrapClass}>
                {title && (
                  <p className="font-semibold text-[10px] leading-4">{title}</p>
                )}
                {date && <p className="text-[9.5px] leading-4">{date}</p>}
                {issuer && <p className="text-[9.5px] leading-4">{issuer}</p>}
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
      <section key="languages" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle>Languages</SidebarTitle>

        <div className="space-y-2">
          {filledLanguages.map((lang: any, index: number) => {
            const name =
              typeof lang === "string"
                ? lang
                : text(lang.language_name, lang.language, lang.name);

            const level =
              typeof lang === "string" ? "" : text(lang.proficiency, lang.level);

            const rating = ratingFromLevel(level);

            return (
              <div key={index} className={wrapClass}>
                {name && <p className="font-semibold text-[10px]">{name}</p>}
                {level && <p className="text-[9.5px] leading-4">{level}</p>}
                <RatingDots rating={rating} />
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderTraining = (sectionId: string) => {
    const section = trainingSections.find(
      (trainingSection: any) => trainingSection.id === sectionId
    );

    if (!section) return null;

    const items = asArray(section.items).filter((item) => hasText(String(item)));

    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={`mb-3 ${wrapClass}`}>
        <SidebarTitle>{section.title}</SidebarTitle>

        <ul className="list-disc ml-4 space-y-1 text-[9.5px] leading-4">
          {items.map((item: any, index: number) => (
            <li key={index} className={wrapClass}>
              {String(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderPublicationSection = (sectionId: string) => {
    const section = publicationSections.find(
      (publicationSection: any) => publicationSection.id === sectionId
    );

    if (!section) return null;

    const items = asArray(section.items).filter((item) => hasText(String(item)));

    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={`mb-3 ${wrapClass}`}>
        <SidebarTitle>{section.title}</SidebarTitle>

        <ul className="list-disc ml-4 space-y-1 text-[9.5px] leading-4">
          {items.map((item: any, index: number) => (
            <li key={index} className={wrapClass}>
              {String(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderSimpleListSection = (
    sectionId: string,
    title: string,
    items: any[]
  ) => {
    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={`mb-3 ${wrapClass}`}>
        <SidebarTitle>{title}</SidebarTitle>

        <ul className="space-y-2 text-[9.5px] leading-4">
          {items.map((item: any, index: number) => {
            const value =
              typeof item === "string"
                ? item
                : item.title || item.name || item.description || JSON.stringify(item);

            return (
              <li key={index} className={wrapClass}>
                {value}
              </li>
            );
          })}
        </ul>
      </section>
    );
  };

  const renderCustomSection = (sectionId: string) => {
    const section = nonSidebarCustomSections.find(
      (customSection: any) => customSection.id === sectionId
    );

    if (!section) return null;

    const items = asArray(section.items).filter((item) => hasText(String(item)));

    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={`mb-3 ${wrapClass}`}>
        <MainTitle>{section.title}</MainTitle>

        <ul className="list-disc ml-4 space-y-1 text-[9.5px] leading-4">
          {items.map((item: any, index: number) => (
            <li key={index} className={wrapClass}>
              {String(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderMainSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderProfiles();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();

    if (forcedSidebarIds.includes(sectionId)) {
      return null;
    }

    if (sectionId === "summary") {
      return null;
    }

    return renderCustomSection(sectionId);
  };

  const renderSidebarSection = (sectionId: string) => {
    if (sectionId === "certifications") return renderCertifications();
    if (trainingSectionIds.includes(sectionId)) return renderTraining(sectionId);
    if (publicationSectionIds.includes(sectionId)) {
      return renderPublicationSection(sectionId);
    }
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "awards") {
      return renderSimpleListSection("awards", "Awards & Recognition", filledAwards);
    }
    if (sectionId === "interests") {
      return renderSimpleListSection("interests", "Interests", filledInterests);
    }
    if (sectionId === "hobbies") {
      return renderSimpleListSection("hobbies", "Hobbies", filledHobbies);
    }
    if (sectionId === "conferences") {
      return renderSimpleListSection("conferences", "Conferences", filledConferences);
    }
    if (sectionId === "courses") {
      return renderSimpleListSection("courses", "Courses", filledCourses);
    }
    if (sectionId === "other") {
      return renderSimpleListSection("other", "Other", filledOther);
    }

    return null;
  };

  return (
    <ResumePage>
      <div
        className="flex h-[1123px] bg-white text-[#111] text-[10.5px] leading-[1.38] overflow-hidden"
        style={{ fontFamily }}
      >
        {/* LEFT SIDEBAR */}
        <aside
          className="w-[35%] h-full flex flex-col shrink-0 overflow-hidden"
          style={{ backgroundColor: paleSidebar }}
        >
          {renderHeader()}

          <div className="p-3 flex-1 overflow-hidden">
            {sidebarOrder.map((sectionId: string) =>
              renderSidebarSection(sectionId)
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="w-[65%] h-full overflow-hidden min-w-0">
          {renderSummary()}

          <div className="p-4">
            {mainOrder.map((sectionId: string) =>
              renderMainSection(sectionId)
            )}
          </div>
        </main>
      </div>
    </ResumePage>
  );
};

export default Template11;