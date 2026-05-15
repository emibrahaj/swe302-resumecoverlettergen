import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template11: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    education,
    experience,
    certifications,
    awards,
    languages,
  } = resumeData;

  return (
    <div className="min-h-screen bg-[#f6f2f7] text-[#222] font-serif flex">

      {/* LEFT SIDEBAR */}
      <aside className="w-[34%] bg-[#5f17b5] text-white">

        {/* HEADER */}
        <div className="p-8">

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-36 h-36 object-cover"
            />
          )}

          <h1 className="text-4xl font-bold mt-5">
            {personalInfo.fullName}
          </h1>

          <p className="mt-2 leading-7 text-[15px]">
            {personalInfo.jobTitle}
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
            <p>{personalInfo.linkedin}</p>
            <p>{personalInfo.certification}</p>
          </div>

        </div>

        {/* SIDEBAR CONTENT */}
        <div className="bg-[#d9c8eb] text-[#222] p-8 min-h-full">

          {/* CERTIFICATIONS */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
              Certifications
            </h2>

            <div className="space-y-7 mt-5">
              {certifications?.map((cert: any, index: number) => (
                <div key={index}>
                  <h3 className="font-bold text-lg">
                    {cert.title}
                  </h3>

                  <p className="mt-1">
                    {cert.date}
                  </p>

                  <p className="text-sm mt-1">
                    {cert.provider}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* AWARDS */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
              Awards & Recognition
            </h2>

            <div className="space-y-7 mt-5">
              {awards?.map((award: any, index: number) => (
                <div key={index}>
                  <h3 className="font-bold text-lg">
                    {award.title}
                  </h3>

                  <p className="mt-1">
                    {award.date}
                  </p>

                  <p className="text-sm mt-2 leading-7">
                    {award.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* LANGUAGES */}
          <section>
            <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
              Languages
            </h2>

            <div className="space-y-5 mt-5">
              {languages?.map((lang: any, index: number) => (
                <div key={index}>

                  <div className="flex justify-between mb-2">
                    <span>{lang.language}</span>
                    <span>{lang.level}</span>
                  </div>

                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((dot) => (
                      <div
                        key={dot}
                        className={`w-3 h-3 rounded-full ${
                          dot <= lang.rating
                            ? "bg-[#5f17b5]"
                            : "bg-[#bda8d3]"
                        }`}
                      />
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </section>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="w-[66%] p-8">

        {/* SUMMARY */}
        <section className="mb-10">
          <p className="text-[15px] leading-8">
            {summary}
          </p>
        </section>

        {/* ONLINE */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
            Online Presence
          </h2>

          <div className="grid grid-cols-2 gap-6 mt-5">
            {personalInfo.links?.map(
              (link: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold">
                    {link.platform}
                  </h3>

                  <p className="text-sm mt-1">
                    {link.url}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* SKILLS */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
            Technical Skills
          </h2>

          <div className="grid grid-cols-2 gap-8 mt-6">
            {skills?.map((skill: any, index: number) => (
              <div key={index}>

                <h3 className="font-bold text-xl">
                  {skill.category}
                </h3>

                <p className="mt-1">
                  {skill.level}
                </p>

                <p className="text-sm mt-2">
                  {skill.items}
                </p>

                <div className="flex gap-2 mt-4">
                  {[1,2,3,4,5].map((dot) => (
                    <div
                      key={dot}
                      className={`w-3 h-3 rounded-full ${
                        dot <= skill.rating
                          ? "bg-[#5f17b5]"
                          : "bg-[#d7c8e7]"
                      }`}
                    />
                  ))}
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* EDUCATION */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
            Education
          </h2>

          {education?.map((edu: any, index: number) => (
            <div key={index} className="mt-5">

              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-xl">
                    {edu.school}
                  </h3>

                  <p>{edu.degree}</p>
                </div>

                <div className="text-right text-sm">
                  <p>{edu.gpa}</p>

                  <p>
                    {edu.location} • {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-7">
                {edu.description}
              </p>

            </div>
          ))}
        </section>

        {/* EXPERIENCE */}
        <section>
          <h2 className="text-3xl font-bold text-[#5f17b5] border-b border-[#5f17b5] pb-2">
            Professional Experience
          </h2>

          <div className="space-y-8 mt-6">
            {experience?.map((exp: any, index: number) => (
              <div key={index}>

                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-xl">
                      {exp.company}
                    </h3>

                    <p>{exp.position}</p>
                  </div>

                  <div className="text-right text-sm">
                    <p>{exp.location}</p>

                    <p>
                      {exp.startDate} - {exp.endDate}
                    </p>
                  </div>
                </div>

                <ul className="list-disc ml-6 mt-4 space-y-2 text-sm leading-7">
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

      </main>

    </div>
  );
};

export default Template11;