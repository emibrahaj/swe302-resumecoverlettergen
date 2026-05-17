"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template6: React.FC<Props> = ({
  resumeData,
}) => {
  const {
    personalInfo,
    summary,
    education,
    experience,
    links,
    skills,
  } = resumeData;

  return (
    <ResumePage>
      <div className="bg-[#f7f7f7] text-[#2b2b2b] font-serif p-5 border-t-[6px] border-[#1180c7] text-[11px] leading-[1.4]">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-4">

          <div className="flex-1">

            <h1 className="text-[26px] font-bold leading-tight">
              {personalInfo.fullName}
            </h1>

            <p className="text-[14px] text-gray-600 mt-1">
              {personalInfo.jobTitle}
            </p>

            <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-[#1180c7]">
              <span>{personalInfo.location}</span>
              <span>{personalInfo.email}</span>
              <span>{personalInfo.phone}</span>
              <span>{personalInfo.website}</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[#1180c7]">
              <span>{personalInfo.github}</span>
              <span>{personalInfo.linkedin}</span>
            </div>

          </div>

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-24 h-24 object-cover"
            />
          )}

        </div>

        {/* SUMMARY */}
        <section className="mt-5 border-b border-gray-300 pb-4">

          <h2 className="text-[16px] font-bold uppercase mb-3">
            Summary
          </h2>

          <p className="text-[11px] leading-5">
            {summary}
          </p>

        </section>

        {/* EDUCATION */}
        <section className="mt-5 border-b border-gray-300 pb-4">

          <h2 className="text-[16px] font-bold uppercase mb-3">
            Education
          </h2>

          <div className="space-y-4">

            {education?.map((edu: any, index: number) => (
              <div key={index}>

                <div className="flex justify-between items-start gap-4">

                  <div>

                    <h3 className="text-[13px] font-bold">
                      {edu.school}
                    </h3>

                    <p className="text-[11px] mt-1">
                      {edu.degree}
                    </p>

                  </div>

                  <div className="text-right text-[10px] text-gray-700 shrink-0">

                    <p>{edu.gpa}</p>

                    <p>
                      {edu.location} • {edu.startDate} - {edu.endDate}
                    </p>

                  </div>

                </div>

                <p className="text-[10px] mt-2 leading-4">
                  {edu.description}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* EXPERIENCE */}
        <section className="mt-5 border-b border-gray-300 pb-4">

          <h2 className="text-[16px] font-bold uppercase mb-3">
            Experience
          </h2>

          <div className="space-y-5">

            {experience?.map((exp: any, index: number) => (
              <div key={index}>

                <div className="flex justify-between gap-4">

                  <div>

                    <h3 className="text-[13px] font-bold">
                      {exp.company}
                    </h3>

                    <p className="text-[11px] mt-1">
                      {exp.position}
                    </p>

                  </div>

                  <div className="text-right text-[10px] text-gray-700 shrink-0">

                    <p>{exp.location}</p>

                    <p>
                      {exp.startDate} - {exp.endDate}
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

        {/* PROFILES */}
        <section className="mt-5 border-b border-gray-300 pb-4">

          <h2 className="text-[16px] font-bold uppercase mb-3">
            Profiles
          </h2>

          <div className="space-y-3">

            {links?.map((link: any, index: number) => (
              <div key={index}>

                <h3 className="text-[12px] font-bold">
                  {link.platform}
                </h3>

                <p className="text-[10px] text-[#1180c7] mt-1 break-words">
                  {link.url}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* SKILLS */}
        <section className="mt-5">

          <h2 className="text-[16px] font-bold uppercase mb-3">
            Skills
          </h2>

          <div className="space-y-4">

            {skills?.map((skill: any, index: number) => (
              <div key={index}>

                <h3 className="text-[12px] font-bold">
                  {skill.category}
                </h3>

                <p className="text-[11px] mt-1">
                  {skill.level}
                </p>

                <p className="text-[10px] mt-1 leading-4">
                  {skill.items}
                </p>

                {/* STARS */}
                <div className="flex gap-1 mt-2">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`text-[14px] leading-none ${
                        star <= skill.rating
                          ? "text-[#1180c7]"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </div>
                  ))}

                </div>

              </div>
            ))}

          </div>

        </section>

      </div>
    </ResumePage>
  );
};

export default Template6;