"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template7: React.FC<Props> = ({
  resumeData,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    experience,
    links,
  } = resumeData;

  return (
    <ResumePage>
      <div className="bg-[#f7f7f7] text-[#1f1f1f] font-serif p-5 text-[11px] leading-[1.4]">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-gray-500 pb-4">

          <div className="flex-1">

            <h1 className="text-[26px] font-bold leading-tight">
              {personalInfo.fullName}
            </h1>

            <p className="text-gray-700 mt-1 text-[13px]">
              {personalInfo.jobTitle}
            </p>

            <div className="flex flex-wrap gap-3 mt-3 text-[10px]">
              <span>{personalInfo.email}</span>
              <span>{personalInfo.phone}</span>
              <span>{personalInfo.location}</span>
              <span>{personalInfo.website}</span>
            </div>

          </div>

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}

        </div>

        {/* ONLINE PRESENCE */}
        <section className="mt-5 border-b border-gray-400 pb-4">

          <h2 className="text-[16px] font-bold mb-3">
            Online Presence
          </h2>

          <div className="grid grid-cols-3 gap-4">

            {links?.map((link: any, index: number) => (
              <div key={index}>

                <h3 className="font-semibold text-[11px]">
                  {link.platform}
                </h3>

                <p className="mt-1 text-[10px] break-words">
                  {link.url}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* SUMMARY */}
        <section className="mt-5 border-b border-gray-400 pb-4">

          <h2 className="text-[16px] font-bold mb-3">
            Professional Summary
          </h2>

          <p className="text-[11px] leading-5">
            {summary}
          </p>

        </section>

        {/* SKILLS */}
        <section className="mt-5 border-b border-gray-400 pb-4">

          <h2 className="text-[16px] font-bold mb-4">
            Technical Skills
          </h2>

          <div className="grid grid-cols-2 gap-x-10 gap-y-4">

            {skills?.map((skill: any, index: number) => (
              <div key={index}>

                <h3 className="text-[12px] font-bold">
                  {skill.category}
                </h3>

                <p className="mt-1 text-[11px]">
                  {skill.level}
                </p>

                <p className="mt-1 text-[10px] leading-4">
                  {skill.items}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* EXPERIENCE */}
        <section className="mt-5">

          <h2 className="text-[16px] font-bold mb-4">
            Professional Experience
          </h2>

          <div className="space-y-5">

            {experience?.map((exp: any, index: number) => (
              <div key={index}>

                <div className="flex justify-between items-start gap-4">

                  <div>

                    <h3 className="text-[13px] font-bold">
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

      </div>
    </ResumePage>
  );
};

export default Template7;