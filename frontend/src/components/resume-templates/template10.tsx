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

const Template10: React.FC<Props> = ({ resumeData, styleConfig }) => {
  const {
    personalInfo = {},
    summary = "",
    skills = [],
    technicalSkills = [],
    education = [],
    experience = [],
    projects = [],
    links = [],
    profiles = [],
    certifications = [],
    awards = [],
    languages = [],
    interests = [],
    hobbies = [],
    conferences = [],
    courses = [],
    other = [],
    customSections = [],
  } = resumeData || {};

  const primaryColor = styleConfig?.primaryColor || "#dc4ca0";
  const softPink = "#f5d3e8";
  const fontFamily = styleConfig?.fontFamily || "Georgia, serif";

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
      : [];

const profileItems = onlineSource
  .filter((profile: any) =>
    text(
      profile?.platform,
      profile?.label,
      profile?.name,
      profile?.username,
      profile?.url,
      profile?.link
    )
  )
  .filter((profile: any, index: number, arr: any[]) => {
    const platform = text(
      profile?.platform,
      profile?.label,
      profile?.name,
      profile?.username
    );

    const url = text(profile?.url, profile?.link, profile?.value);

    return (
      arr.findIndex((item: any) => {
        const itemPlatform = text(
          item?.platform,
          item?.label,
          item?.name,
          item?.username
        );

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
        exp?.companyName,
        exp?.company_name,
        exp?.position,
        exp?.title,
        exp?.role,
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
    const title = String(section?.title || "").toLowerCase();
    return title.includes("training");
  });

  const publicationSections = filledCustomSections.filter((section: any) => {
    const title = String(section?.title || "").toLowerCase();
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
          "summary",
          "skills",
          "education",
          "experience",
          "projects",
          ...nonSidebarCustomSections.map((section: any) => section.id),
          "certifications",
          "awards",
          ...trainingSectionIds,
          "languages",
          "interests",
          ...publicationSectionIds,
        ];

  const forcedSidebarIds = [
    "certifications",
    "awards",
    "languages",
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
  const mainSectionClass = `mb-4 ${wrapClass}`;
  const sidebarSectionClass = `mb-4 ${wrapClass}`;

  const MainTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className="text-[14px] font-bold mb-2"
      style={{ color: primaryColor }}
    >
      {children}
    </h2>
  );

  const SidebarTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className="text-[13px] font-bold mb-2"
      style={{ color: primaryColor }}
    >
      {children}
    </h2>
  );

  const SkillBars = ({ rating }: { rating: number }) => (
    <div className="flex gap-[3px] mt-1">
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className="h-[5px] flex-1 border"
          style={{
            backgroundColor: bar <= rating ? primaryColor : "transparent",
            borderColor: primaryColor,
          }}
        />
      ))}
    </div>
  );

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div
      className="w-full h-[7px] mt-1 border"
      style={{ borderColor: primaryColor }}
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          backgroundColor: primaryColor,
        }}
      />
    </div>
  );

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
      <header
        className="h-[86px] text-white relative px-5 flex items-start"
        style={{ backgroundColor: primaryColor }}
      >
        {photoUrl && (
          <img
            src={photoUrl}
            alt="profile"
            className="absolute left-[64px] top-[18px] w-[108px] h-[128px] object-cover bg-white"
          />
        )}

        <div className="ml-[275px] pt-[18px] min-w-0">
          {fullName && (
            <h1 className={`text-[23px] font-bold leading-tight ${wrapClass}`}>
              {fullName}
            </h1>
          )}

          {jobTitle && (
            <p className={`text-[10.5px] leading-4 ${wrapClass}`}>
              {jobTitle}
            </p>
          )}
        </div>
      </header>
    );
  };

  const renderContact = () => {
    const items = [
      personalInfo.email && `✉ ${personalInfo.email}`,
      personalInfo.phone && `☎ ${personalInfo.phone}`,
      personalInfo.location && `⌾ ${personalInfo.location}`,
      linkedin && `▣ ${linkedin}`,
      website && `⊕ ${website}`,
      github && `⌘ ${github}`,
    ].filter(Boolean);

    if (items.length === 0) return null;

    return (
      <section className={`mb-3 ${wrapClass}`}>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-[9.5px] leading-4">
          {items.map((item, index) => (
            <p key={index} className={wrapClass}>
              {item}
            </p>
          ))}
        </div>
      </section>
    );
  };

const renderProfiles = () => {
  if (profileItems.length === 0) return null;

  return (
    <section key="onlinePresence" className={mainSectionClass}>
      <MainTitle>Online Presence</MainTitle>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {profileItems.map((profile: any, index: number) => {
          const platform = text(
            profile.platform,
            profile.label,
            profile.name,
            profile.username
          );

          const url = text(profile.url, profile.link, profile.value);

          return (
            <div key={index} className={wrapClass}>
              {platform && (
                <h3 className={`font-semibold text-[10.5px] ${wrapClass}`}>
                  {platform}
                </h3>
              )}

              {url && (
                <p className={`text-[9.5px] leading-4 ${wrapClass}`}>
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
        <MainTitle>Professional Summary</MainTitle>

        <p className={`text-[10.5px] leading-4 whitespace-pre-wrap ${wrapClass}`}>
          {summary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (filledSkills.length === 0) return null;

    return (
      <section key="skills" className={mainSectionClass}>
        <MainTitle>Technical Skills</MainTitle>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {filledSkills.map((skill: any, index: number) => {
            if (typeof skill === "string") {
              return (
                <div key={index} className={wrapClass}>
                  <h3 className="font-semibold text-[10.5px]">{skill}</h3>
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
                  <h3 className={`font-semibold text-[10.5px] ${wrapClass}`}>
                    {title}
                  </h3>
                )}

                {level && (
                  <p className={`text-[9.5px] mt-0.5 ${wrapClass}`}>
                    {level}
                  </p>
                )}

                {items.length > 0 && (
                  <p className={`text-[9.5px] leading-4 mt-0.5 ${wrapClass}`}>
                    {items.join(", ")}
                  </p>
                )}

                <SkillBars rating={rating} />
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
        <MainTitle>Education</MainTitle>

        <div className="space-y-3">
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
                      <h3 className={`text-[11px] font-bold ${wrapClass}`}>
                        {school}
                      </h3>
                    )}

                    {degree && (
                      <p className={`text-[10px] ${wrapClass}`}>{degree}</p>
                    )}
                  </div>

                  {(dates || text(edu.location)) && (
                    <div className="text-right text-[9.5px] shrink-0 max-w-[170px] break-words">
                      {dates && <p>{dates}</p>}
                      {text(edu.location) && <p>{text(edu.location)}</p>}
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
      <section key="experience" className={mainSectionClass}>
        <MainTitle>Professional Experience</MainTitle>

        <div className="space-y-3">
          {filledExperience.map((exp: any, index: number) => {
            const company = text(exp.company, exp.companyName, exp.company_name);
            const position = text(exp.position, exp.title, exp.role);

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
                      <h3 className={`text-[11px] font-bold ${wrapClass}`}>
                        {company}
                      </h3>
                    )}

                    {position && (
                      <p className={`text-[10px] ${wrapClass}`}>{position}</p>
                    )}
                  </div>

                  {(dates || text(exp.location)) && (
                    <div className="text-right text-[9.5px] shrink-0 max-w-[170px] break-words">
                      {text(exp.location) && <p>{text(exp.location)}</p>}
                      {dates && <p>{dates}</p>}
                    </div>
                  )}
                </div>

                {bullets.length > 0 && (
                  <ul className="list-disc ml-5 mt-1 space-y-1 text-[9.5px] leading-4">
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
      <section key="projects" className={mainSectionClass}>
        <MainTitle>Projects</MainTitle>

        <div className="space-y-3">
          {filledProjects.map((project: any, index: number) => {
            const projectName = text(
              project.name,
              project.title,
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
                      <h3 className={`text-[11px] font-bold ${wrapClass}`}>
                        {projectName}
                      </h3>
                    )}

                    {text(project.link, project.url) && (
                      <p className={`text-[9.5px] ${wrapClass}`}>
                        {text(project.link, project.url)}
                      </p>
                    )}
                  </div>

                  {dates && (
                    <div className="text-right text-[9.5px] shrink-0 max-w-[150px] break-words">
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
      <section key="certifications" className={sidebarSectionClass}>
        <SidebarTitle>Certifications</SidebarTitle>

        <div className="space-y-3">
          {filledCertifications.map((cert: any, index: number) => {
            const certName = text(
              cert.certification_name,
              cert.title,
              cert.name
            );

            const issuer = text(
              cert.issuer,
              cert.company_name,
              cert.provider,
              cert.organization
            );

            const date = text(cert.date_obtained, cert.date, cert.year);

            return (
              <div key={index} className={wrapClass}>
                {certName && (
                  <h3 className={`font-semibold text-[10px] ${wrapClass}`}>
                    {certName}
                  </h3>
                )}

                {date && (
                  <p className={`text-[9.5px] mt-0.5 ${wrapClass}`}>{date}</p>
                )}

                {issuer && (
                  <p className={`text-[9.5px] mt-0.5 ${wrapClass}`}>{issuer}</p>
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
      <section key="languages" className={sidebarSectionClass}>
        <SidebarTitle>Languages</SidebarTitle>

        <div className="space-y-3">
          {filledLanguages.map((lang: any, index: number) => {
            const language =
              typeof lang === "string"
                ? lang
                : text(lang.language_name, lang.language, lang.name);

            const level =
              typeof lang === "string"
                ? ""
                : text(lang.level, lang.proficiency);

            const progress = Math.min(ratingFromLevel(level) * 20, 100);

            return (
              <div key={index} className={wrapClass}>
                {language && (
                  <p className={`text-[10px] font-semibold ${wrapClass}`}>
                    {language}
                  </p>
                )}

                {level && (
                  <p className={`text-[9.5px] ${wrapClass}`}>{level}</p>
                )}

                <ProgressBar progress={progress} />
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
      <section key={sectionId} className={sidebarSectionClass}>
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

  const renderTraining = (sectionId: string) => {
    const section = trainingSections.find(
      (trainingSection: any) => trainingSection.id === sectionId
    );

    if (!section) return null;

    return renderListSection(sectionId, section.title, asArray(section.items));
  };

  const renderPublicationSection = (sectionId: string) => {
    const section = publicationSections.find(
      (publicationSection: any) => publicationSection.id === sectionId
    );

    if (!section) return null;

    return renderListSection(sectionId, section.title, asArray(section.items));
  };

  const renderCustomSection = (sectionId: string) => {
    const section = nonSidebarCustomSections.find(
      (customSection: any) => customSection.id === sectionId
    );

    if (!section) return null;

    const items = asArray(section.items).filter((item) => hasText(String(item)));

    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={mainSectionClass}>
        <MainTitle>{section.title}</MainTitle>

        <ul className="list-disc ml-5 space-y-1 text-[9.5px] leading-4">
          {items.map((item: any, index: number) => (
            <li key={index} className={wrapClass}>
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderMainSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderProfiles();
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "projects") return renderProjects();

    if (forcedSidebarIds.includes(sectionId)) return null;

    return renderCustomSection(sectionId);
  };

  const renderSidebarSection = (sectionId: string) => {
    if (sectionId === "certifications") return renderCertifications();
    if (sectionId === "languages") return renderLanguages();
    if (trainingSectionIds.includes(sectionId)) return renderTraining(sectionId);
    if (publicationSectionIds.includes(sectionId)) {
      return renderPublicationSection(sectionId);
    }
    if (sectionId === "awards") return renderListSection("awards", "Awards & Recognition", filledAwards);
    if (sectionId === "interests") return renderListSection("interests", "Interests", filledInterests);
    if (sectionId === "hobbies") return renderListSection("hobbies", "Hobbies", filledHobbies);
    if (sectionId === "conferences") return renderListSection("conferences", "Conferences", filledConferences);
    if (sectionId === "courses") return renderListSection("courses", "Courses", filledCourses);
    if (sectionId === "other") return renderListSection("other", "Other", filledOther);

    return null;
  };

  return (
    <ResumePage>
      <div
        className="h-[1123px] bg-white text-[#111] text-[10.5px] leading-[1.35] overflow-hidden"
        style={{ fontFamily }}
      >
        {renderHeader()}

        <div className="flex h-[calc(1123px-86px)] overflow-hidden">
          {/* LEFT SIDEBAR */}
          <aside className="w-[34%] p-4 pt-[104px] h-full overflow-hidden">
            {sidebarOrder.map((sectionId: string) =>
              renderSidebarSection(sectionId)
            )}
          </aside>

          {/* MAIN CONTENT */}
          <main className="w-[66%] px-5 py-3 h-full overflow-hidden min-w-0">
            {renderContact()}

            {mainOrder.map((sectionId: string) =>
              renderMainSection(sectionId)
            )}
          </main>
        </div>
      </div>
    </ResumePage>
  );
};

export default Template10;