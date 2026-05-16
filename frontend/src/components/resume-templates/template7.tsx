import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template7: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    experience,
    links,
  } = resumeData;

  return (
    <div className="bg-[#f7f7f7] text-[#1f1f1f] font-serif p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-gray-500 pb-5">
        <div className="flex-1">
          <h1 className="text-5xl font-bold">
            {personalInfo.fullName}
          </h1>

          <p className="text-gray-700 mt-2 text-xl">
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap gap-5 mt-5 text-sm">
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
            className="w-32 h-32 rounded-lg object-cover"
          />
        )}
      </div>

      {/* ONLINE PRESENCE */}
      <section className="mt-7 border-b border-gray-400 pb-6">
        <h2 className="text-3xl mb-4">
          Online Presence
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {links?.map((link: any, index: number) => (
            <div key={index}>
              <h3 className="font-semibold text-lg">
                {link.platform}
              </h3>

              <p className="mt-2 text-[15px]">
                {link.url}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SUMMARY */}
      <section className="mt-7 border-b border-gray-400 pb-6">
        <h2 className="text-3xl mb-4">
          Professional Summary
        </h2>

        <p className="text-[16px] leading-8">
          {summary}
        </p>
      </section>

      {/* SKILLS */}
      <section className="mt-7 border-b border-gray-400 pb-6">
        <h2 className="text-3xl mb-5">
          Technical Skills
        </h2>

        <div className="grid grid-cols-2 gap-x-20 gap-y-8">
          {skills?.map((skill: any, index: number) => (
            <div key={index}>
              <h3 className="text-xl font-bold">
                {skill.category}
              </h3>

              <p className="mt-2 text-lg">
                {skill.level}
              </p>

              <p className="mt-2 text-[15px]">
                {skill.items}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="mt-7">
        <h2 className="text-3xl mb-5">
          Professional Experience
        </h2>

        <div className="space-y-10">
          {experience?.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">
                    {exp.company}
                  </h3>

                  <p className="text-lg mt-1">
                    {exp.position}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <p>{exp.location}</p>

                  <p>
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
              </div>

              <ul className="list-disc ml-6 mt-4 space-y-3 text-[15px] leading-7">
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
  );
};

export default Template7;