import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template3: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    experience,
    education,
    links,
  } = resumeData;

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-4 text-[#222] font-sans">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center mb-4 border">
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="profile"
            className="w-20 h-20 rounded-xl object-cover"
          />
        )}

        <div className="flex-1">
          <h1 className="text-[24px] font-bold leading-tight">
            {personalInfo.fullName}
          </h1>

          <p className="text-gray-600 mt-1 text-[13px]">
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-gray-700">
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.location}</span>
            <span>{personalInfo.website}</span>
          </div>
        </div>
      </div>

      {/* ONLINE PRESENCE */}
      {links?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border mb-4">
          <h2 className="text-cyan-700 font-bold text-[15px] mb-3">
            Online Presence
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {links?.map((link: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold text-[11px]">
                  {link.platform}
                </h3>

                <p className="text-[10px] text-gray-600 mt-1 break-words">
                  {link.url}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {summary && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border mb-4">
          <h2 className="text-cyan-700 font-bold text-[15px] mb-3">
            Professional Summary
          </h2>

          <p className="text-[11px] leading-5 text-gray-800">
            {summary}
          </p>
        </div>
      )}

      {/* SKILLS */}
      {skills?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border mb-4">
          <h2 className="text-cyan-700 font-bold text-[15px] mb-4">
            Technical Skills
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {skills?.map((skill: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[11px]">
                    {skill.name || skill.category}
                  </h3>

                  {(skill.level || skill.proficiency) && (
                    <span className="text-[9px] text-gray-500">
                      {skill.level || skill.proficiency}
                    </span>
                  )}
                </div>

                {/* SKILL BAR */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-cyan-600 rounded-full"
                    style={{
                      width: `${
                        skill.progress ||
                        (skill.proficiency === "Beginner"
                          ? 25
                          : skill.proficiency === "Intermediate"
                          ? 50
                          : skill.proficiency === "Advanced"
                          ? 75
                          : skill.proficiency === "Expert"
                          ? 100
                          : 70)
                      }%`,
                    }}
                  />
                </div>

                {skill.items && (
                  <p className="text-[10px] mt-1 leading-4">
                    {Array.isArray(skill.items)
                      ? skill.items.join(", ")
                      : skill.items}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {experience?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border mb-4">
          <h2 className="text-cyan-700 font-bold text-[15px] mb-4">
            Professional Experience
          </h2>

          <div className="space-y-6">
            {experience?.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[12px]">
                      {exp.company}
                    </h3>

                    <p className="text-[11px] text-gray-600">
                      {exp.position}
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-gray-600 shrink-0">
                    <p>{exp.location}</p>

                    <p>
                      {exp.startDate} - {exp.endDate}
                    </p>
                  </div>
                </div>

                <ul className="list-disc ml-5 mt-2 space-y-1 text-[10px] leading-5 text-gray-800">
                  {exp.bullets?.map(
                    (bullet: string, i: number) => (
                      <li key={i}>{bullet}</li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION */}
      {education?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border">
          <h2 className="text-cyan-700 font-bold text-[15px] mb-4">
            Education
          </h2>

          <div className="space-y-4">
            {education?.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[12px]">
                      {edu.school}
                    </h3>

                    <p className="text-[11px] text-gray-600">
                      {edu.degree}
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-gray-600 shrink-0">
                    <p>{edu.location}</p>

                    <p>
                      {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                </div>

                {edu.description && (
                  <p className="text-[10px] mt-2 leading-5 text-gray-700">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Template3;