"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template4: React.FC<Props> = ({
  resumeData,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    education,
    experience,
    customSections,
  } = resumeData;

  return (
    <ResumePage>
      <div className="bg-[#f5f5f5] text-[#1d1d1d] font-serif min-h-full p-5 text-[11px] leading-[1.4]">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6 border-b border-[#5b4bff] pb-4">

          <div className="flex-1">

            <h1 className="text-[28px] font-bold leading-tight">
              {personalInfo.fullName}
            </h1>

            <div className="flex flex-wrap gap-3 mt-4 text-[10px]">
              <span>{personalInfo.email}</span>
              <span>{personalInfo.phone}</span>
              <span>{personalInfo.website}</span>
              <span>{personalInfo.github}</span>
            </div>

          </div>

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-20 h-20 object-cover shrink-0"
            />
          )}

        </div>

        {/* SUMMARY */}
        {summary && (
          <section className="mb-6">

            <h2 className="text-[#5b4bff] font-bold text-[16px] uppercase border-b-2 border-[#5b4bff] pb-1 mb-3">
              Professional Summary
            </h2>

            <p className="text-[11px] leading-5">
              {summary}
            </p>

          </section>
        )}

        {/* SKILLS */}
        {skills?.length > 0 && (
          <section className="mb-6">

            <h2 className="text-[#5b4bff] font-bold text-[16px] uppercase border-b-2 border-[#5b4bff] pb-1 mb-4">
              Technical Skills
            </h2>

            <div className="grid grid-cols-3 gap-5">

              {skills?.map((skill: any, index: number) => (
                <div key={index}>

                  <h3 className="text-[12px] font-bold">
                    {skill.category}
                  </h3>

                  <p className="text-[10px] mt-1 text-gray-600">
                    {skill.level}
                  </p>

                  <p className="text-[10px] mt-1 leading-4">
                    {Array.isArray(skill.items)
                      ? skill.items.join(", ")
                      : skill.items}
                  </p>

                  {/* SKILL DOTS */}
                  <div className="flex gap-1 mt-2">

                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className={`w-2.5 h-2.5 rounded-full ${
                          dot <= (skill.rating || 3)
                            ? "bg-[#5b4bff]"
                            : "border border-[#5b4bff]"
                        }`}
                      />
                    ))}

                  </div>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* EDUCATION */}
        {education?.length > 0 && (
          <section className="mb-6">

            <h2 className="text-[#5b4bff] font-bold text-[16px] uppercase border-b-2 border-[#5b4bff] pb-1 mb-4">
              Education
            </h2>

            <div className="space-y-5">

              {education?.map((edu: any, index: number) => (
                <div key={index}>

                  <div className="flex justify-between items-start gap-4">

                    <div>

                      <div className="flex gap-2 flex-wrap items-center">

                        <h3 className="text-[12px]">
                          {edu.degree}
                        </h3>

                        <span className="text-[12px] font-bold">
                          {edu.school}
                        </span>

                      </div>

                      <p className="text-[10px] mt-2 text-gray-700">
                        {edu.gpa} {edu.location ? `• ${edu.location}` : ""}
                      </p>

                    </div>

                    <div className="text-[10px] shrink-0">
                      {edu.startDate} – {edu.endDate}
                    </div>

                  </div>

                  {edu.description && (
                    <p className="text-[10px] mt-2 leading-4">
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
          <section className="mb-6">

            <h2 className="text-[#5b4bff] font-bold text-[16px] uppercase border-b-2 border-[#5b4bff] pb-1 mb-4">
              Professional Experience
            </h2>

            <div className="space-y-6">

              {experience?.map((exp: any, index: number) => (
                <div key={index}>

                  <div className="flex justify-between items-start gap-4">

                    <div className="flex gap-2 flex-wrap items-center">

                      <h3 className="text-[12px]">
                        {exp.position}
                      </h3>

                      <span className="text-[12px] font-bold">
                        {exp.company}
                      </span>

                    </div>

                    <div className="text-right text-[10px] shrink-0">
                      <p>
                        {exp.startDate} – {exp.endDate}
                      </p>
                    </div>

                  </div>

                  <ul className="list-disc ml-5 mt-2 space-y-1 text-[10px] leading-4">

                    {exp.bullets?.map(
                      (bullet: string, i: number) => (
                        <li key={i}>{bullet}</li>
                      )
                    )}

                  </ul>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* CUSTOM SECTIONS */}
        {customSections?.map((section: any, index: number) => (
          <section key={index} className="mb-6">

            <h2 className="text-[#5b4bff] font-bold text-[16px] uppercase border-b-2 border-[#5b4bff] pb-1 mb-4">
              {section.title}
            </h2>

            <div className="space-y-3">

              {section.items?.map((item: any, i: number) => (
                <div key={i} className="text-[10px] leading-4">

                  {/* STRING ITEM */}
                  {typeof item === "string" && (
                    <p>{item}</p>
                  )}

                  {/* OBJECT ITEM */}
                  {typeof item === "object" && (
                    <>
                      {item.name && (
                        <p className="font-semibold text-[11px]">
                          {item.name}
                        </p>
                      )}

                      {item.level && (
                        <p className="text-gray-600">
                          {item.level}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-1">
                          {item.description}
                        </p>
                      )}

                      {/* OPTIONAL PROFICIENCY */}
                      {(item.rating || item.proficiency) && (
                        <div className="flex gap-1 mt-2">

                          {[1, 2, 3, 4, 5].map((dot) => (
                            <div
                              key={dot}
                              className={`w-2.5 h-2.5 rounded-full ${
                                dot <= (item.rating || item.proficiency || 3)
                                  ? "bg-[#5b4bff]"
                                  : "border border-[#5b4bff]"
                              }`}
                            />
                          ))}

                        </div>
                      )}

                    </>
                  )}

                </div>
              ))}

            </div>

          </section>
        ))}

      </div>
    </ResumePage>
  );
};

export default Template4;