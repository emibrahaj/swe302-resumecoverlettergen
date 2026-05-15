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
    <div className="bg-[#f3f3f3] p-6 text-[#222] font-sans">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm p-5 flex gap-5 items-center mb-5 border">
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="profile"
            className="w-24 h-24 rounded-xl object-cover"
          />
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {personalInfo.fullName}
          </h1>

          <p className="text-gray-600 mt-1">
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.location}</span>
            <span>{personalInfo.website}</span>
          </div>
        </div>
      </div>

      {/* ONLINE PRESENCE */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border mb-5">
        <h2 className="text-cyan-700 font-bold mb-4">
          Online Presence
        </h2>

        <div className="grid grid-cols-4 gap-4">
          {links?.map((link: any, index: number) => (
            <div key={index}>
              <h3 className="font-semibold text-sm">
                {link.platform}
              </h3>

              <p className="text-sm text-gray-600">
                {link.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border mb-5">
        <h2 className="text-cyan-700 font-bold mb-3">
          Professional Summary
        </h2>

        <p className="text-sm leading-7 text-gray-800">
          {summary}
        </p>
      </div>

      {/* SKILLS */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border mb-5">
        <h2 className="text-cyan-700 font-bold mb-4">
          Technical Skills
        </h2>

        <div className="grid grid-cols-4 gap-5">
          {skills?.map((skill: any, index: number) => (
            <div key={index}>
              <h3 className="font-semibold text-sm">
                {skill.category}
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                {skill.level}
              </p>

              <p className="text-sm mt-2">
                {skill.items}
              </p>

              {/* LEVEL BAR */}
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`h-2 w-6 rounded-full ${
                      bar <= skill.rating
                        ? "bg-cyan-600"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXPERIENCE */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border mb-5">
        <h2 className="text-cyan-700 font-bold mb-5">
          Professional Experience
        </h2>

        <div className="space-y-8">
          {experience?.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">
                    {exp.company}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {exp.position}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-600">
                  <p>{exp.location}</p>

                  <p>
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
              </div>

              <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-gray-800">
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

      {/* EDUCATION */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border">
        <h2 className="text-cyan-700 font-bold mb-5">
          Education
        </h2>

        <div className="space-y-5">
          {education?.map((edu: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">
                    {edu.school}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {edu.degree}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-600">
                  <p>{edu.location}</p>

                  <p>
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              </div>

              <p className="text-sm mt-2 text-gray-700">
                {edu.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Template3;