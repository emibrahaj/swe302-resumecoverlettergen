import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const template2: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    experience,
    education,
    skills,
    certifications,
    links,
  } = resumeData;

  return (
    <div className="w-full bg-white text-[#222] font-serif">
      {/* HEADER */}
      <div className="text-center border-b border-gray-400 pb-4">
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="profile"
            className="w-28 h-28 object-cover mx-auto mb-3"
          />
        )}

        <h1 className="text-4xl font-bold tracking-tight">
          {personalInfo.fullName}
        </h1>

        <p className="text-sm mt-1 text-gray-700">
          {personalInfo.jobTitle}
        </p>

        <div className="flex justify-center gap-4 mt-3 text-sm flex-wrap">
          <span>{personalInfo.email}</span>
          <span>{personalInfo.phone}</span>
          <span>{personalInfo.location}</span>
          <span>{personalInfo.website}</span>
        </div>
      </div>

      {/* ONLINE PRESENCE */}
      <section className="grid grid-cols-[180px_1fr] border-b border-gray-400 py-4">
        <h2 className="font-bold uppercase text-sm">
          Online Presence
        </h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {links?.map((link: any, index: number) => (
            <div key={index}>
              <strong>{link.platform}</strong>
              <p>{link.url}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUMMARY */}
      <section className="grid grid-cols-[180px_1fr] border-b border-gray-400 py-4">
        <h2 className="font-bold uppercase text-sm">
          Professional Summary
        </h2>

        <p className="text-sm leading-relaxed">
          {summary}
        </p>
      </section>

      {/* SKILLS */}
      <section className="grid grid-cols-[180px_1fr] border-b border-gray-400 py-4">
        <h2 className="font-bold uppercase text-sm">
          Technical Skills
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {skills?.map((skill: any, index: number) => (
            <div key={index}>
              <h3 className="font-bold text-sm">
                {skill.category}
              </h3>

              <p className="text-xs italic text-gray-600">
                {skill.level}
              </p>

              <p className="text-sm mt-1">
                {skill.items}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section className="grid grid-cols-[180px_1fr] border-b border-gray-400 py-4">
        <h2 className="font-bold uppercase text-sm">
          Education
        </h2>

        <div>
          {education?.map((edu: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between">
                <h3 className="font-bold">
                  {edu.school}
                </h3>

                <span className="text-sm">
                  {edu.location}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <p>{edu.degree}</p>
                <p>
                  {edu.startDate} - {edu.endDate}
                </p>
              </div>

              <p className="text-sm mt-2">
                {edu.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="grid grid-cols-[180px_1fr] py-4">
        <h2 className="font-bold uppercase text-sm">
          Professional Experience
        </h2>

        <div className="space-y-6">
          {experience?.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between">
                <h3 className="font-bold">
                  {exp.company}
                </h3>

                <span className="text-sm">
                  {exp.location}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <p>{exp.position}</p>

                <p>
                  {exp.startDate} - {exp.endDate}
                </p>
              </div>

              <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
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

export default template2;