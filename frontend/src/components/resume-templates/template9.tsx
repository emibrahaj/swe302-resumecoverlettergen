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

const SectionTitle = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <h2
    className="text-[13px] font-bold border-b pb-[3px] mb-2 break-words"
    style={{ borderColor: color }}
  >
    {children}
  </h2>
);

const SidebarTitle = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <h2
    className="text-[12px] font-bold border-b pb-[3px] mb-2 break-words"
    style={{ borderColor: color }}
  >
    {children}
  </h2>
);

const Template9: React.FC<Props> = ({ resumeData, styleConfig }) => {
  const {
    personalInfo = {},
    summary = "",
    links = [],
    profiles = [],
    skills = [],
    experience = [],
    education = [],
    projects = [],
    languages = [],
    hobbies = [],
    conferences = [],
    certifications = [],
    courses = [],
    other = [],
    extraSections = [],
    customSections = [],
  } = resumeData || {};

  const primaryColor = styleConfig?.primaryColor || "#1185c4";
  const paleSidebar = "#c6d9e5";
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

  const website = text(personalInfo.website, personalInfo.github);

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

  const filledSkills = asArray(skills).filter((skill: any) => {
    if (typeof skill === "string") return hasText(skill);

    const items = normalizeSkillItems(skill?.items);

    return (
      text(skill?.category, skill?.name, skill?.skill_name) ||
      text(skill?.level, skill?.proficiency) ||
      items.length > 0
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
      edu?.year
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
      project?.description
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
      cert?.organization,
      cert?.company_name,
      cert?.date,
      cert?.date_obtained,
      cert?.year
    )
  );

  const filledHobbies = asArray(hobbies).filter((item: any) =>
    typeof item === "string"
      ? hasText(item)
      : text(item?.name, item?.title, item?.value)
  );

  const filledConferences = asArray(conferences).filter((conference: any) =>
    text(
      conference?.title,
      conference?.name,
      conference?.organizer,
      conference?.location,
      conference?.date
    )
  );

  const filledCourses = asArray(courses).filter((course: any) =>
    text(course?.title, course?.name, course?.provider, course?.platform, course?.date)
  );

  const filledOther = asArray(other).filter((item: any) =>
    typeof item === "string"
      ? hasText(item)
      : text(item?.value, item?.title, item?.name)
  );

  const mergedCustomSections = [
    ...asArray(customSections),
    ...asArray(extraSections),
  ];

  const filledCustomSections = mergedCustomSections.filter((section: any) => {
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

  const trainingSectionIds = trainingSections.map((section: any) => section.id);

  const consumedSidebarTitles = new Set([
    "languages",
    "language",
    "certifications",
    "certification",
    "certificates",
    "certificate",
    "courses",
    "course",
    "hobbies",
    "hobby",
    "conferences",
    "conference",
    "other",
  ]);

  const nonSidebarCustomSections = filledCustomSections.filter((section: any) => {
    const title = String(section?.title || "").trim().toLowerCase();

    return !trainingSectionIds.includes(section.id) && !consumedSidebarTitles.has(title);
  });

  const bodyOrder =
    Array.isArray(resumeData?.sectionOrder) && resumeData.sectionOrder.length > 0
      ? resumeData.sectionOrder
      : [
          "summary",
          "experience",
          "education",
          "projects",
          ...nonSidebarCustomSections.map((section: any) => section.id),
          "onlinePresence",
          "skills",
          "certifications",
          ...trainingSectionIds,
          "languages",
          "hobbies",
          "conferences",
          "courses",
          "other",
        ];

  const forcedSidebarIds = [
    "onlinePresence",
    "skills",
    "certifications",
    ...trainingSectionIds,
    "languages",
    "hobbies",
    "conferences",
    "courses",
    "other",
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

  const renderHeader = () => {
    const hasHeader =
      fullName ||
      jobTitle ||
      photoUrl ||
      text(
        personalInfo.location,
        personalInfo.phone,
        personalInfo.email,
        personalInfo.website,
        personalInfo.github
      );

    if (!hasHeader) return null;

    return (
      <div
        className="p-3 text-white min-w-0 overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {photoUrl && (
          <img
            src={photoUrl}
            alt="profile"
            className="w-[86px] h-[86px] object-cover mb-3"
          />
        )}

        {fullName && (
          <h1 className={`text-[18px] font-bold leading-tight ${wrapClass}`}>
            {fullName}
          </h1>
        )}

        {jobTitle && (
          <p className={`text-[10.5px] leading-4 mt-1 ${wrapClass}`}>
            {jobTitle}
          </p>
        )}

        <div className={`mt-3 space-y-1 text-[9.5px] leading-4 ${wrapClass}`}>
          {personalInfo.location && <p>⊙ {personalInfo.location}</p>}
          {personalInfo.phone && <p>☎ {personalInfo.phone}</p>}
          {personalInfo.email && <p>✉ {personalInfo.email}</p>}
          {website && <p>🌐 {website}</p>}
        </div>
      </div>
    );
  };

  const renderProfiles = () => {
    if (profileItems.length === 0) return null;

    return (
      <section key="onlinePresence" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle color={primaryColor}>Profiles</SidebarTitle>

        <div className="space-y-1.5">
          {profileItems.map((profile: any, index: number) => {
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
                {label && <p className="font-semibold text-[10px]">{label}</p>}
                {url && <p className="text-[9.5px] leading-4">{url}</p>}
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
        <SidebarTitle color={primaryColor}>Skills</SidebarTitle>

        <div className="space-y-2">
          {filledSkills.map((skill: any, index: number) => {
            if (typeof skill === "string") {
              return (
                <p key={index} className={`text-[10px] leading-4 ${wrapClass}`}>
                  {skill}
                </p>
              );
            }

            const title = text(skill.category, skill.name, skill.skill_name);
            const level = text(skill.level, skill.proficiency);
            const items = normalizeSkillItems(skill.items);

            return (
              <div key={index} className={wrapClass}>
                {title && <p className="font-semibold text-[10.5px]">{title}</p>}
                {level && <p className="text-[9.5px] leading-4">{level}</p>}
                {items.length > 0 && (
                  <p className="text-[9.5px] leading-4">{items.join(", ")}</p>
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
        <SidebarTitle color={primaryColor}>Certifications</SidebarTitle>

        <div className="space-y-2">
          {filledCertifications.map((cert: any, index: number) => {
            const title = text(cert.title, cert.certification_name, cert.name);

            const issuer = text(
              cert.issuer,
              cert.provider,
              cert.organization,
              cert.company_name,
              cert.platform
            );

            const date = text(cert.date, cert.date_obtained, cert.year);

            return (
              <div key={index} className={wrapClass}>
                {title && (
                  <p className="font-semibold text-[10px] leading-4">{title}</p>
                )}
                {issuer && <p className="text-[9.5px] leading-4">{issuer}</p>}
                {date && <p className="text-[9.5px] leading-4">{date}</p>}
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
        <SidebarTitle color={primaryColor}>{section.title}</SidebarTitle>

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

  const renderLanguages = () => {
    if (filledLanguages.length === 0) return null;

    return (
      <section key="languages" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle color={primaryColor}>Languages</SidebarTitle>

        <div className="space-y-1.5">
          {filledLanguages.map((lang: any, index: number) => {
            const name =
              typeof lang === "string"
                ? lang
                : text(lang.language_name, lang.language, lang.name);

            const level =
              typeof lang === "string" ? "" : text(lang.proficiency, lang.level);

            return (
              <div key={index} className={wrapClass}>
                {name && <p className="font-semibold text-[10px]">{name}</p>}
                {level && <p className="text-[9.5px] leading-4">{level}</p>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderHobbies = () => {
    if (filledHobbies.length === 0) return null;

    return (
      <section key="hobbies" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle color={primaryColor}>Hobbies</SidebarTitle>

        <ul className="list-disc ml-4 space-y-1 text-[9.5px] leading-4">
          {filledHobbies.map((hobby: any, index: number) => (
            <li key={index} className={wrapClass}>
              {typeof hobby === "string"
                ? hobby
                : text(hobby.name, hobby.title, hobby.value, "Hobby")}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderConferences = () => {
    if (filledConferences.length === 0) return null;

    return (
      <section key="conferences" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle color={primaryColor}>Conferences</SidebarTitle>

        <div className="space-y-2">
          {filledConferences.map((conference: any, index: number) => {
            const title = text(conference.title, conference.name);
            const meta = [conference.organizer, conference.location]
              .filter(Boolean)
              .join(" • ");
            const date = text(conference.date);

            return (
              <div key={index} className={wrapClass}>
                {title && <p className="font-semibold text-[10px]">{title}</p>}
                {meta && <p className="text-[9.5px] leading-4">{meta}</p>}
                {date && <p className="text-[9.5px] leading-4">{date}</p>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCourses = () => {
    if (filledCourses.length === 0) return null;

    return (
      <section key="courses" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle color={primaryColor}>Courses</SidebarTitle>

        <div className="space-y-2">
          {filledCourses.map((course: any, index: number) => {
            const title = text(course.title, course.name);
            const provider = text(course.provider, course.platform);
            const date = text(course.date);

            return (
              <div key={index} className={wrapClass}>
                {title && <p className="font-semibold text-[10px]">{title}</p>}
                {provider && <p className="text-[9.5px] leading-4">{provider}</p>}
                {date && <p className="text-[9.5px] leading-4">{date}</p>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderOther = () => {
    if (filledOther.length === 0) return null;

    return (
      <section key="other" className={`mb-3 ${wrapClass}`}>
        <SidebarTitle color={primaryColor}>Additional Information</SidebarTitle>

        <ul className="list-disc ml-4 space-y-1 text-[9.5px] leading-4">
          {filledOther.map((item: any, index: number) => (
            <li key={index} className={wrapClass}>
              {typeof item === "string"
                ? item
                : text(item.value, item.title, item.name, "Additional Item")}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderSummary = () => {
    if (!hasText(summary)) return null;

    return (
      <section key="summary" className={`mb-4 ${wrapClass}`}>
        <p className={`text-[10.8px] leading-5 whitespace-pre-wrap ${wrapClass}`}>
          {summary}
        </p>
      </section>
    );
  };

  const renderExperience = () => {
    if (filledExperience.length === 0) return null;

    return (
      <section key="experience" className={`mb-4 ${wrapClass}`}>
        <SectionTitle color={primaryColor}>Experience</SectionTitle>

        <div className="space-y-3">
          {filledExperience.map((exp: any, index: number) => {
            const company = text(exp.company, exp.company_name, exp.companyName);
            const position = text(exp.position, exp.role, exp.title);

            const dates = [
              text(exp.startDate, exp.start_date),
              text(exp.endDate, exp.end_date),
            ]
              .filter(Boolean)
              .join(" to ");

            const bullets =
              asArray(exp.bullets).length > 0
                ? asArray(exp.bullets)
                : text(exp.description)
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean);

            return (
              <div
                key={index}
                className={`border-l-[4px] pl-2 ${wrapClass}`}
                style={{ borderColor: primaryColor }}
              >
                <div className="flex justify-between gap-3 min-w-0">
                  <div className={`flex-1 ${wrapClass}`}>
                    {company && (
                      <h3 className={`text-[12px] font-bold ${wrapClass}`}>
                        {company}
                      </h3>
                    )}

                    {position && (
                      <p className={`text-[10.5px] ${wrapClass}`}>
                        {position}
                      </p>
                    )}

                    {text(exp.website, exp.url) && (
                      <p className={`italic text-[9.5px] ${wrapClass}`}>
                        {text(exp.website, exp.url)}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[9.5px] shrink-0 max-w-[160px] break-words">
                    {dates && <p className="font-semibold">{dates}</p>}
                    {text(exp.location) && <p>{text(exp.location)}</p>}
                  </div>
                </div>

                {bullets.length > 0 && (
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-[10.5px] leading-4">
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

  const renderEducation = () => {
    if (filledEducation.length === 0) return null;

    return (
      <section key="education" className={`mb-4 ${wrapClass}`}>
        <SectionTitle color={primaryColor}>Education</SectionTitle>

        <div className="space-y-3">
          {filledEducation.map((edu: any, index: number) => {
            const school = text(edu.school, edu.university, edu.institution);
            const degree = text(edu.degree);

            const dates = [
              text(edu.startDate, edu.start_date),
              text(edu.endDate, edu.end_date, edu.year),
            ]
              .filter(Boolean)
              .join(" to ");

            return (
              <div
                key={index}
                className="border-l-[4px] pl-2 flex justify-between gap-3 min-w-0"
                style={{ borderColor: primaryColor }}
              >
                <div className={`flex-1 ${wrapClass}`}>
                  {school && (
                    <h3 className={`text-[12px] font-bold ${wrapClass}`}>
                      {school}
                    </h3>
                  )}

                  {text(edu.location) && (
                    <p className={`text-[10.5px] ${wrapClass}`}>
                      {text(edu.location)}
                    </p>
                  )}
                </div>

                <div className="text-right text-[9.5px] shrink-0 max-w-[160px] break-words">
                  {dates && <p className="font-semibold">{dates}</p>}
                  {degree && <p>{degree}</p>}
                </div>
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
      <section key="projects" className={`mb-4 ${wrapClass}`}>
        <SectionTitle color={primaryColor}>Projects</SectionTitle>

        <div className="space-y-3">
          {filledProjects.map((project: any, index: number) => {
            const projectName = text(
              project.title,
              project.name,
              project.project_name
            );

            return (
              <div
                key={index}
                className={`border-l-[4px] pl-2 ${wrapClass}`}
                style={{ borderColor: primaryColor }}
              >
                {projectName && (
                  <h3 className={`text-[12px] font-bold ${wrapClass}`}>
                    {projectName}
                  </h3>
                )}

                {text(project.role) && (
                  <p className={`italic text-[10px] ${wrapClass}`}>
                    {text(project.role)}
                  </p>
                )}

                {text(project.link, project.url) && (
                  <p className={`text-[9.5px] ${wrapClass}`}>
                    {text(project.link, project.url)}
                  </p>
                )}

                {text(project.description) && (
                  <p className={`mt-1 text-[10.5px] leading-4 ${wrapClass}`}>
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

  const renderCustomSection = (sectionId: string) => {
    const section = nonSidebarCustomSections.find(
      (customSection: any) => customSection.id === sectionId
    );

    if (!section) return null;

    const items = asArray(section.items).filter((item) => hasText(String(item)));

    if (items.length === 0) return null;

    return (
      <section key={sectionId} className={`mb-4 ${wrapClass}`}>
        <SectionTitle color={primaryColor}>{section.title}</SectionTitle>

        <ul className="list-disc ml-4 space-y-1 text-[10.5px] leading-4">
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
    if (sectionId === "summary") return renderSummary();
    if (sectionId === "experience") return renderExperience();
    if (sectionId === "education") return renderEducation();
    if (sectionId === "projects") return renderProjects();

    if (forcedSidebarIds.includes(sectionId)) {
      return null;
    }

    return renderCustomSection(sectionId);
  };

  const renderSidebarSection = (sectionId: string) => {
    if (sectionId === "onlinePresence") return renderProfiles();
    if (sectionId === "skills") return renderSkills();
    if (sectionId === "certifications") return renderCertifications();
    if (trainingSectionIds.includes(sectionId)) return renderTraining(sectionId);
    if (sectionId === "languages") return renderLanguages();
    if (sectionId === "hobbies") return renderHobbies();
    if (sectionId === "conferences") return renderConferences();
    if (sectionId === "courses") return renderCourses();
    if (sectionId === "other") return renderOther();

    return null;
  };

  return (
    <ResumePage>
      <div
        className="flex h-[1123px] bg-white text-[#111] text-[10.5px] leading-[1.38] overflow-hidden"
        style={{ fontFamily }}
      >
        <aside
          className="w-[27%] h-full flex flex-col shrink-0 overflow-hidden"
          style={{ backgroundColor: paleSidebar }}
        >
          {renderHeader()}

          <div className="p-3 flex-1 overflow-hidden">
            {sidebarOrder.map((sectionId: string) =>
              renderSidebarSection(sectionId)
            )}
          </div>
        </aside>

        <main className="w-[73%] h-full p-5 overflow-hidden min-w-0">
          {mainOrder.map((sectionId: string) => renderMainSection(sectionId))}
        </main>
      </div>
    </ResumePage>
  );
};

export default Template9;