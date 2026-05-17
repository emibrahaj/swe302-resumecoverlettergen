"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template8: React.FC<Props> = ({
  resumeData,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    experience,
    education,
    certifications,
    awards,
    languages,
    interests,
  } = resumeData;

  return (
    <ResumePage>
      <div className="w-[794px] h-[1123px] flex bg-[#f5f5f5] text-[#222] font-serif text-[11px] leading-[1.35] overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-[72%] p-5">

          {/* HEADER */}
          <div className="flex gap-4 items-start">

            {personalInfo?.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                alt="profile"
                className="w-20 h-20 object-cover shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">

              <h1 className="text-[24px] font-bold leading-tight">
                {personalInfo?.fullName}
              </h1>

              <p className="text-gray-700 mt-1 text-[12px]">
                {personalInfo?.jobTitle}
              </p>

              <div className="mt-3 space-y-1 text-[10px] break-words">
                {personalInfo?.email && (
                  <p>{personalInfo.email}</p>
                )}

                {personalInfo?.phone && (
                  <p>{personalInfo.phone}</p>
                )}

                {personalInfo?.location && (
                  <p>{personalInfo.location}</p>
                )}

                {personalInfo?.website && (
                  <p>{personalInfo.website}</p>
                )}
              </div>

            </div>

          </div>

          {/* ONLINE */}
          {personalInfo?.links?.length > 0 && (
            <section className="mt-4 border-t border-[#0f7a54] pt-2">

              <h2 className="text-[15px] text-[#0f7a54] font-bold">
                Online Presence
              </h2>

              <div className="grid grid-cols-2 gap-3 mt-2">

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
            <section className="mt-4 border-t border-[#0f7a54] pt-2">

              <h2 className="text-[15px] text-[#0f7a54] font-bold">
                Professional Summary
              </h2>

              <p className="mt-2 leading-5 text-[11px]">
                {summary}
              </p>

            </section>
          )}

          {/* SKILLS */}
          {skills?.length > 0 && (
            <section className="mt-4 border-t border-[#0f7a54] pt-2">

              <h2 className="text-[15px] text-[#0f7a54] font-bold">
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

                      <div className="w-full h-1.5 bg-[#d7e7df] mt-2 rounded-sm">
                        <div
                          className="h-1.5 bg-[#0f7a54] rounded-sm"
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
            <section className="mt-4 border-t border-[#0f7a54] pt-2">

              <h2 className="text-[15px] text-[#0f7a54] font-bold">
                Education
              </h2>

              <div className="space-y-3 mt-3">

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
            <section className="mt-4 border-t border-[#0f7a54] pt-2">

              <h2 className="text-[15px] text-[#0f7a54] font-bold">
                Professional Experience
              </h2>

              <div className="space-y-4 mt-3">

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

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[28%] bg-[#0f7a54] text-white p-4 flex flex-col h-full">

          {/* CERTIFICATIONS */}
          {certifications?.length > 0 && (
            <section>

              <h2 className="text-[15px] font-bold border-b border-white pb-1">
                Certifications
              </h2>

              <div className="space-y-3 mt-3">

                {certifications.map((cert: any, index: number) => (
                  <div key={index}>

                    <h3 className="font-semibold text-[11px]">
                      {typeof cert === "string"
                        ? cert
                        : cert.title ||
                          cert.name ||
                          "Certification"}
                    </h3>

                    {(cert.date || cert.year) && (
                      <p className="text-[10px] mt-1">
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

          {/* AWARDS */}
          {awards?.length > 0 && (
            <section className="mt-5">

              <h2 className="text-[15px] font-bold border-b border-white pb-1">
                Awards & Recognition
              </h2>

              <div className="space-y-3 mt-3">

                {awards.map((award: any, index: number) => (
                  <div key={index}>

                    <h3 className="font-semibold text-[11px]">
                      {award.title}
                    </h3>

                    {award.date && (
                      <p className="text-[10px] mt-1">
                        {award.date}
                      </p>
                    )}

                    {award.description && (
                      <p className="text-[10px] mt-1 leading-4">
                        {award.description}
                      </p>
                    )}

                  </div>
                ))}

              </div>

            </section>
          )}

          {/* LANGUAGES */}
          {languages?.length > 0 && (
            <section className="mt-5">

              <h2 className="text-[15px] font-bold border-b border-white pb-1">
                Languages
              </h2>

              <div className="space-y-2 mt-3">

                {languages.map((lang: any, index: number) => (

                  <div key={index}>

                    <div className="flex justify-between text-[10px]">

                      <span>
                        {typeof lang === "string"
                          ? lang
                          : lang.language ||
                            lang.name ||
                            "Language"}
                      </span>

                      {(lang.level ||
                        lang.proficiency) && (
                        <span>
                          {lang.level ||
                            lang.proficiency}
                        </span>
                      )}

                    </div>

                    <div className="w-full h-1.5 bg-[#5d9a80] mt-1 rounded-sm">
                      <div
                        className="h-1.5 bg-white rounded-sm"
                        style={{
                          width: `${lang.progress || 80}%`,
                        }}
                      />
                    </div>

                  </div>

                ))}

              </div>

            </section>
          )}

          {/* INTERESTS */}
          {interests?.length > 0 && (
            <section className="mt-5">

              <h2 className="text-[15px] font-bold border-b border-white pb-1">
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

        </aside>

      </div>
    </ResumePage>
  );
};

export default Template8;