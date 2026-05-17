"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template5: React.FC<Props> = ({
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
      <div className="bg-[#f5f5f5] min-h-full p-5 text-[#1f1f1f] font-serif text-[11px] leading-[1.4]">

        {/* HEADER */}
        <div className="flex items-start gap-4 border-b border-gray-500 pb-4">

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}

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

        </div>

        {/* ONLINE PRESENCE */}
        <section className="mt-4">

          <h2 className="text-[16px] font-semibold mb-2">
            Online Presence
          </h2>

          <div className="grid grid-cols-3 gap-3 text-[10px]">

            {links?.map((link: any, index: number) => (
              <div key={index}>

                <strong className="text-[11px]">
                  {link.platform}
                </strong>

                <p className="mt-1 text-gray-700 break-words">
                  {link.url}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* SUMMARY */}
        <section className="mt-5">

          <h2 className="text-[16px] font-semibold mb-2">
            Professional Summary
          </h2>

          <p className="leading-5 text-[11px]">
            {summary}
          </p>

        </section>

        {/* SKILLS */}
        <section className="mt-5">

          <h2 className="text-[16px] font-semibold mb-3">
            Technical Skills
          </h2>

          <div className="grid grid-cols-2 gap-x-10 gap-y-5">

            {skills?.map((skill: any, index: number) => (
              <div key={index}>

                <h3 className="font-semibold text-[12px]">
                  {skill.category}
                </h3>

                <p className="mt-1 text-[11px]">
                  {skill.level}
                </p>

                <p className="mt-1 text-[10px] leading-4">
                  {skill.items}
                </p>

                {/* LEVEL BOXES */}
                <div className="flex gap-1 mt-2">

                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-2.5 h-2.5 ${
                        bar <= skill.rating
                          ? "bg-gray-700"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* EXPERIENCE */}
        <section className="mt-6">

          <h2 className="text-[16px] font-semibold mb-3">
            Professional Experience
          </h2>

          <div className="space-y-6">

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

export default Template5;