import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template5: React.FC<Props> = ({
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
    <div className="bg-[#f5f5f5] min-h-full p-8 text-[#1f1f1f] font-serif">
      {/* HEADER */}
      <div className="flex items-start gap-6 border-b border-gray-500 pb-5">
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="profile"
            className="w-24 h-24 rounded-lg object-cover"
          />
        )}

        <div className="flex-1">
          <h1 className="text-4xl font-bold">
            {personalInfo.fullName}
          </h1>

          <p className="text-gray-700 mt-1">
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap gap-5 mt-4 text-sm">
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.location}</span>
            <span>{personalInfo.website}</span>
          </div>
        </div>
      </div>

      {/* ONLINE PRESENCE */}
      <section className="mt-5">
        <h2 className="text-2xl font-semibold mb-3">
          Online Presence
        </h2>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {links?.map((link: any, index: number) => (
            <div key={index}>
              <strong>{link.platform}</strong>

              <p className="mt-1 text-gray-700">
                {link.url}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SUMMARY */}
      <section className="mt-7">
        <h2 className="text-2xl font-semibold mb-3">
          Professional Summary
        </h2>

        <p className="leading-8 text-[15px]">
          {summary}
        </p>
      </section>

      {/* SKILLS */}
      <section className="mt-7">
        <h2 className="text-2xl font-semibold mb-4">
          Technical Skills
        </h2>

        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
          {skills?.map((skill: any, index: number) => (
            <div key={index}>
              <h3 className="font-semibold text-lg">
                {skill.category}
              </h3>

              <p className="mt-1">
                {skill.level}
              </p>

              <p className="mt-2 text-[15px]">
                {skill.items}
              </p>

              {/* LEVEL BOXES */}
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-3 h-3 ${
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
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-5">
          Professional Experience
        </h2>

        <div className="space-y-10">
          {experience?.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {exp.company}
                  </h3>

                  <p className="text-lg">
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

export default Template5;