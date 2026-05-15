import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template4: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    education,
    experience,
  } = resumeData;

  return (
    <div className="bg-[#f5f5f5] text-[#1d1d1d] font-serif p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-5xl font-bold">
            {personalInfo.fullName}
          </h1>

          <div className="flex flex-wrap gap-6 mt-6 text-lg">
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
            className="w-28 h-28 object-cover"
          />
        )}
      </div>

      {/* SUMMARY */}
      <section className="mb-10">
        <h2 className="text-[#5b4bff] font-bold text-3xl uppercase border-b-2 border-[#5b4bff] pb-2 mb-4">
          Professional Summary
        </h2>

        <p className="text-xl leading-10">
          {summary}
        </p>
      </section>

      {/* SKILLS */}
      <section className="mb-10">
        <h2 className="text-[#5b4bff] font-bold text-3xl uppercase border-b-2 border-[#5b4bff] pb-2 mb-6">
          Technical Skills
        </h2>

        <div className="grid grid-cols-3 gap-10">
          {skills?.map((skill: any, index: number) => (
            <div key={index}>
              <h3 className="text-2xl font-bold">
                {skill.category}
              </h3>

              <p className="text-xl mt-2">
                {skill.level}
              </p>

              <p className="text-lg mt-2">
                {skill.items}
              </p>

              {/* SKILL DOTS */}
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-4 h-4 rounded-full ${
                      dot <= skill.rating
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

      {/* EDUCATION */}
      <section className="mb-10">
        <h2 className="text-[#5b4bff] font-bold text-3xl uppercase border-b-2 border-[#5b4bff] pb-2 mb-6">
          Education
        </h2>

        {education?.map((edu: any, index: number) => (
          <div key={index} className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-3 flex-wrap items-center">
                  <h3 className="text-2xl">
                    {edu.degree}
                  </h3>

                  <span className="text-2xl font-bold">
                    {edu.school}
                  </span>
                </div>

                <p className="text-xl mt-4">
                  {edu.gpa} • {edu.location}
                </p>
              </div>

              <div className="text-xl">
                {edu.startDate} – {edu.endDate}
              </div>
            </div>

            <p className="text-xl mt-5 leading-9">
              {edu.description}
            </p>
          </div>
        ))}
      </section>

      {/* EXPERIENCE */}
      <section>
        <h2 className="text-[#5b4bff] font-bold text-3xl uppercase border-b-2 border-[#5b4bff] pb-2 mb-6">
          Professional Experience
        </h2>

        <div className="space-y-12">
          {experience?.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-wrap items-center">
                  <h3 className="text-2xl">
                    {exp.position}
                  </h3>

                  <span className="text-2xl font-bold">
                    {exp.company}
                  </span>
                </div>

                <div className="text-right text-xl">
                  <p>{exp.startDate} – {exp.endDate}</p>
                </div>
              </div>

              <ul className="list-disc ml-8 mt-5 space-y-4 text-xl leading-9">
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

export default Template4;