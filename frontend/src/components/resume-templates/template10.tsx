import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template10: React.FC<Props> = ({
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
    interests,
  } = resumeData;

  return (
    <div className="min-h-screen bg-white font-serif text-[#222]">

      {/* TOP HEADER */}
      <div className="bg-[#d94b9a] text-white px-10 py-5 flex items-center gap-8">

        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="profile"
            className="w-32 h-32 object-cover bg-white"
          />
        )}

        <div className="flex-1">

          <h1 className="text-5xl font-bold">
            {personalInfo.fullName}
          </h1>

          <p className="mt-2 text-lg">
            {personalInfo.jobTitle}
          </p>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 mt-5 text-sm">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
            <p>{personalInfo.website}</p>
            <p>{personalInfo.linkedin}</p>
            <p>{personalInfo.certification}</p>
          </div>

        </div>

      </div>

      {/* BODY */}
      <div className="flex">

        {/* LEFT SIDEBAR */}
        <aside className="w-[34%] p-8">

          {/* CERTIFICATIONS */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-[#d94b9a] mb-5">
              Certifications
            </h2>

            <div className="space-y-7">
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
            <h2 className="text-3xl font-bold text-[#d94b9a] mb-5">
              Awards & Recognition
            </h2>

            <div className="space-y-7">
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
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-[#d94b9a] mb-5">
              Languages
            </h2>

            <div className="space-y-5">
              {languages?.map((lang: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span>{lang.language}</span>
                    <span>{lang.level}</span>
                  </div>

                  <div className="w-full h-2 bg-[#f2d4e5]">
                    <div
                      className="h-2 bg-[#d94b9a]"
                      style={{
                        width: `${lang.progress || 80}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* INTERESTS */}
          <section>
            <h2 className="text-3xl font-bold text-[#d94b9a] mb-5">
              Interests
            </h2>

            <ul className="space-y-4 text-sm leading-7">
              {interests?.map(
                (interest: string, index: number) => (
                  <li key={index}>{interest}</li>
                )
              )}
            </ul>
          </section>

        </aside>

        {/* RIGHT CONTENT */}
        <main className="w-[66%] p-8">

          {/* ONLINE PRESENCE */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-[#d94b9a] border-b border-[#d94b9a] pb-2">
              Online Presence
            </h2>

            <div className="grid grid-cols-2 gap-6 mt-4">
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

          {/* SUMMARY */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-[#d94b9a] border-b border-[#d94b9a] pb-2">
              Professional Summary
            </h2>

            <p className="mt-4 leading-8 text-[15px]">
              {summary}
            </p>
          </section>

          {/* SKILLS */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-[#d94b9a] border-b border-[#d94b9a] pb-2">
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

                  <div className="w-full h-2 bg-[#f2d4e5] mt-4">
                    <div
                      className="h-2 bg-[#d94b9a]"
                      style={{
                        width: `${skill.progress || 80}%`,
                      }}
                    />
                  </div>

                </div>
              ))}
            </div>
          </section>

          {/* EDUCATION */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-[#d94b9a] border-b border-[#d94b9a] pb-2">
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
            <h2 className="text-3xl font-bold text-[#d94b9a] border-b border-[#d94b9a] pb-2">
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

    </div>
  );
};

export default Template10;