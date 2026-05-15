import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template6: React.FC<Props> = ({
  resumeData,
  styleConfig,
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
    <div className="bg-[#f7f7f7] text-[#2b2b2b] font-serif p-8 border-t-8 border-[#1180c7]">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-6">
        <div className="flex-1">
          <h1 className="text-5xl font-bold">
            {personalInfo.fullName}
          </h1>

          <p className="text-2xl text-gray-600 mt-2">
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap gap-5 mt-5 text-lg text-[#1180c7]">
            <span>{personalInfo.location}</span>
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.website}</span>
          </div>

          <div className="flex flex-wrap gap-5 mt-3 text-lg text-[#1180c7]">
            <span>{personalInfo.github}</span>
            <span>{personalInfo.linkedin}</span>
          </div>
        </div>

        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="profile"
            className="w-40 h-40 object-cover"
          />
        )}
      </div>

      {/* SUMMARY */}
      <section className="mt-10 border-b border-gray-300 pb-8">
        <h2 className="text-3xl font-bold uppercase mb-5">
          Summary
        </h2>

        <p className="text-xl leading-10">
          {summary}
        </p>
      </section>

      {/* EDUCATION */}
      <section className="mt-10 border-b border-gray-300 pb-8">
        <h2 className="text-3xl font-bold uppercase mb-5">
          Education
        </h2>

        {education?.map((edu: any, index: number) => (
          <div key={index}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">
                  {edu.school}
                </h3>

                <p className="text-xl mt-2">
                  {edu.degree}
                </p>
              </div>

              <div className="text-right text-xl text-gray-700">
                <p>{edu.gpa}</p>

                <p>
                  {edu.location} • {edu.startDate} - {edu.endDate}
                </p>
              </div>
            </div>

            <p className="text-lg mt-5 leading-9">
              {edu.description}
            </p>
          </div>
        ))}
      </section>

      {/* EXPERIENCE */}
      <section className="mt-10 border-b border-gray-300 pb-8">
        <h2 className="text-3xl font-bold uppercase mb-5">
          Experience
        </h2>

        <div className="space-y-10">
          {experience?.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {exp.company}
                  </h3>

                  <p className="text-xl mt-1">
                    {exp.position}
                  </p>
                </div>

                <div className="text-right text-lg text-gray-700">
                  <p>{exp.location}</p>

                  <p>
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
              </div>

              <ul className="list-disc ml-8 mt-5 space-y-4 text-lg leading-9">
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
      <section className="mt-10 border-b border-gray-300 pb-8">
        <h2 className="text-3xl font-bold uppercase mb-5">
          Profiles
        </h2>

        <div className="space-y-5">
          {links?.map((link: any, index: number) => (
            <div key={index}>
              <h3 className="text-2xl font-bold">
                {link.platform}
              </h3>

              <p className="text-lg text-[#1180c7] mt-1">
                {link.url}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section className="mt-10">
        <h2 className="text-3xl font-bold uppercase mb-5">
          Skills
        </h2>

        <div className="space-y-8">
          {skills?.map((skill: any, index: number) => (
            <div key={index}>
              <h3 className="text-2xl font-bold">
                {skill.category}
              </h3>

              <p className="text-xl mt-1">
                {skill.level}
              </p>

              <p className="text-lg mt-2">
                {skill.items}
              </p>

              {/* STARS */}
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`text-2xl ${
                      star <= skill.rating
                        ? "text-[#1180c7]"
                        : "text-gray-300"
                    }`}
                  >
                    ☆
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Template6;