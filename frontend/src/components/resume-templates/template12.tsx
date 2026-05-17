import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template12: React.FC<Props> = ({
  resumeData,
}) => {
  const {
    personalInfo,
    summary,
    education,
    experience,
    certifications,
    interests,
    languages,
    skills,
    customSections,
  } = resumeData;

  return (
    <div className="min-h-[1123px] bg-white text-[#222] font-serif flex">

      {/* SIDEBAR */}
      <aside className="w-[33%] bg-[#dfe7e8] p-5 flex flex-col">

        {/* PROFILE */}
        <div className="text-center">

          {personalInfo?.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-28 h-28 object-cover mx-auto"
            />
          )}

          <h1 className="text-[24px] font-bold mt-4 leading-tight">
            {personalInfo?.fullName}
          </h1>

          <p className="mt-1 text-[11px] leading-5">
            {personalInfo?.jobTitle}
          </p>

        </div>

        {/* CONTACT */}
        <div className="mt-5 border-t border-[#7e9798] pt-4 space-y-2 text-[10px] break-words">

          {personalInfo?.email && (
            <p>{personalInfo.email}</p>
          )}

          {personalInfo?.phone && (
            <p>{personalInfo.phone}</p>
          )}

          {personalInfo?.location && (
            <p>{personalInfo.location}</p>
          )}

          {personalInfo?.linkedin && (
            <p>{personalInfo.linkedin}</p>
          )}

          {personalInfo?.website && (
            <p>{personalInfo.website}</p>
          )}

        </div>

        {/* CERTIFICATIONS */}
        {certifications?.length > 0 && (
          <section className="mt-6">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Certifications
            </h2>

            <div className="space-y-4 mt-3">

              {certifications.map((cert: any, index: number) => (
                <div key={index}>

                  <h3 className="font-bold text-[11px]">
                    {typeof cert === "string"
                      ? cert
                      : cert.title ||
                        cert.name ||
                        "Certification"}
                  </h3>

                  {(cert.date || cert.year) && (
                    <p className="mt-1 text-[10px]">
                      {cert.date || cert.year}
                    </p>
                  )}

                  {(cert.provider || cert.organization) && (
                    <p className="text-[10px] mt-1">
                      {cert.provider || cert.organization}
                    </p>
                  )}

                </div>
              ))}

            </div>

          </section>
        )}

        {/* LANGUAGES */}
        {languages?.length > 0 && (
          <section className="mt-6">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Languages
            </h2>

            <div className="space-y-3 mt-3">

              {languages.map((lang: any, index: number) => {

                const level =
                  lang.level || lang.proficiency || "Advanced";

                const progressMap: Record<string, number> = {
                  Beginner: 35,
                  Intermediate: 60,
                  Advanced: 80,
                  Expert: 100,
                };

                const progress =
                  progressMap[level] || 80;

                return (
                  <div key={index}>

                    <div className="flex justify-between text-[10px]">

                      <span>
                        {typeof lang === "string"
                          ? lang
                          : lang.language ||
                            lang.name ||
                            "Language"}
                      </span>

                      <span>{level}</span>

                    </div>

                    <div className="w-full h-1.5 bg-[#b6c7c9] mt-1 rounded-sm">
                      <div
                        className="h-1.5 bg-[#4f6d73] rounded-sm"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>

          </section>
        )}

        {/* INTERESTS */}
        {interests?.length > 0 && (
          <section className="mt-6">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Interests
            </h2>

            <ul className="mt-3 space-y-2 text-[10px] leading-4">

              {interests.map(
                (interest: any, index: number) => (
                  <li key={index}>
                    {typeof interest === "string"
                      ? interest
                      : interest.name ||
                        interest.title ||
                        "Interest"}
                  </li>
                )
              )}

            </ul>

          </section>
        )}

        {/* CUSTOM SECTIONS */}
        {customSections?.map((section: any, index: number) => (
          <section key={index} className="mt-6">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              {section.title}
            </h2>

            <ul className="mt-3 space-y-2 text-[10px] leading-4">

              {section.items?.map((item: any, i: number) => (
                <li key={i}>
                  {typeof item === "string"
                    ? item
                    : item.name ||
                      item.title ||
                      item.description ||
                      ""}
                </li>
              ))}

            </ul>

          </section>
        ))}

      </aside>

      {/* MAIN */}
      <main className="w-[67%] p-5">

        {/* ONLINE */}
        {personalInfo?.links?.length > 0 && (
          <section className="mb-5">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Online Presence
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-3">

              {personalInfo.links.map(
                (link: any, index: number) => (
                  <div key={index}>

                    <h3 className="font-semibold text-[11px]">
                      {link.platform}
                    </h3>

                    <p className="text-[10px] mt-1 break-words">
                      {link.url}
                    </p>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* SUMMARY */}
        {summary && (
          <section className="mb-5">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Professional Summary
            </h2>

            <p className="mt-3 leading-5 text-[11px]">
              {summary}
            </p>

          </section>
        )}

        {/* SKILLS */}
        {skills?.length > 0 && (
          <section className="mb-5">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Technical Skills
            </h2>

            <div className="grid grid-cols-2 gap-x-5 gap-y-3 mt-3">

              {skills.map((skill: any, index: number) => {

                const level =
                  skill.level || "Advanced";

                const progressMap: Record<string, number> = {
                  Beginner: 35,
                  Intermediate: 60,
                  Advanced: 80,
                  Expert: 100,
                };

                const progress =
                  progressMap[level] || 80;

                return (
                  <div key={index}>

                    <div className="flex justify-between gap-2">

                      <h3 className="font-bold text-[11px]">
                        {skill.name ||
                          skill.category ||
                          "Skill"}
                      </h3>

                      <span className="text-[10px]">
                        {level}
                      </span>

                    </div>

                    {skill.items && (
                      <p className="mt-1 text-[10px] leading-4">
                        {Array.isArray(skill.items)
                          ? skill.items.join(", ")
                          : skill.items}
                      </p>
                    )}

                    <div className="w-full h-1.5 bg-[#c9d5d6] mt-2 rounded-sm">
                      <div
                        className="h-1.5 bg-[#4f6d73] rounded-sm"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>

          </section>
        )}

        {/* EDUCATION */}
        {education?.length > 0 && (
          <section className="mb-5">

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Education
            </h2>

            <div className="space-y-4 mt-3">

              {education.map((edu: any, index: number) => (
                <div key={index}>

                  <div className="flex justify-between gap-3">

                    <div className="flex-1 min-w-0">

                      <h3 className="font-bold text-[12px]">
                        {edu.school}
                      </h3>

                      <p className="text-[11px] mt-1">
                        {edu.degree}
                      </p>

                    </div>

                    <div className="text-right text-[10px] shrink-0">

                      {edu.gpa && (
                        <p>{edu.gpa}</p>
                      )}

                      <p>
                        {edu.location} • {edu.startDate} - {edu.endDate}
                      </p>

                    </div>

                  </div>

                  {edu.description && (
                    <p className="mt-2 text-[10px] leading-4">
                      {edu.description}
                    </p>
                  )}

                </div>
              ))}

            </div>

          </section>
        )}

        {/* EXPERIENCE */}
        {experience?.length > 0 && (
          <section>

            <h2 className="text-[15px] font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-1">
              Professional Experience
            </h2>

            <div className="space-y-5 mt-3">

              {experience.map((exp: any, index: number) => (
                <div key={index}>

                  <div className="flex justify-between gap-3">

                    <div className="flex-1 min-w-0">

                      <h3 className="font-bold text-[12px]">
                        {exp.company}
                      </h3>

                      <p className="text-[11px] mt-1">
                        {exp.position}
                      </p>

                    </div>

                    <div className="text-right text-[10px] shrink-0">

                      <p>{exp.location}</p>

                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>

                    </div>

                  </div>

                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-[10px] leading-4">

                      {exp.bullets.map(
                        (bullet: string, i: number) => (
                          <li key={i}>{bullet}</li>
                        )
                      )}

                    </ul>
                  )}

                </div>
              ))}

            </div>

          </section>
        )}

      </main>

    </div>
  );
};

export default Template12;