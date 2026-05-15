import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template8: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    skills,
    experience,
    education,
    certifications,
    awards,
    languages,
    interests,
  } = resumeData;

  return (
    <div className="flex bg-[#f5f5f5] text-[#222] min-h-screen font-serif">

      {/* LEFT SIDE */}
      <div className="w-[72%] p-8">

        {/* HEADER */}
        <div className="flex gap-5 items-start">
          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-28 h-28 object-cover"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold">
              {personalInfo.fullName}
            </h1>

            <p className="text-gray-700 mt-1 text-lg">
              {personalInfo.jobTitle}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>{personalInfo.email}</p>
              <p>{personalInfo.phone}</p>
              <p>{personalInfo.location}</p>
              <p>{personalInfo.website}</p>
            </div>
          </div>
        </div>

        {/* ONLINE */}
        <section className="mt-8 border-t border-[#0f7a54] pt-3">
          <h2 className="text-2xl text-[#0f7a54] font-bold">
            Online Presence
          </h2>

          <div className="grid grid-cols-2 gap-5 mt-3">
            {personalInfo.links?.map((link: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold">
                  {link.platform}
                </h3>

                <p className="text-sm mt-1">
                  {link.url}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-8 border-t border-[#0f7a54] pt-3">
          <h2 className="text-2xl text-[#0f7a54] font-bold">
            Professional Summary
          </h2>

          <p className="mt-3 leading-8 text-[15px]">
            {summary}
          </p>
        </section>

        {/* SKILLS */}
        <section className="mt-8 border-t border-[#0f7a54] pt-3">
          <h2 className="text-2xl text-[#0f7a54] font-bold">
            Technical Skills
          </h2>

          <div className="grid grid-cols-2 gap-8 mt-5">
            {skills?.map((skill: any, index: number) => (
              <div key={index}>
                <h3 className="font-bold text-lg">
                  {skill.category}
                </h3>

                <p className="mt-1">
                  {skill.level}
                </p>

                <p className="mt-2 text-sm">
                  {skill.items}
                </p>

                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-6 h-2 ${
                        bar <= skill.rating
                          ? "bg-[#0f7a54]"
                          : "bg-[#d7e7df]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EDUCATION */}
        <section className="mt-8 border-t border-[#0f7a54] pt-3">
          <h2 className="text-2xl text-[#0f7a54] font-bold">
            Education
          </h2>

          {education?.map((edu: any, index: number) => (
            <div key={index} className="mt-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">
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
        <section className="mt-8 border-t border-[#0f7a54] pt-3">
          <h2 className="text-2xl text-[#0f7a54] font-bold">
            Professional Experience
          </h2>

          <div className="space-y-8 mt-5">
            {experience?.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">
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

                <ul className="list-disc ml-6 mt-3 space-y-2 text-sm leading-7">
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

      {/* RIGHT SIDEBAR */}
      <aside className="w-[28%] bg-[#0f7a54] text-white p-6">

        {/* CERTIFICATIONS */}
        <section>
          <h2 className="text-2xl font-bold border-b border-white pb-2">
            Certifications
          </h2>

          <div className="space-y-5 mt-5">
            {certifications?.map((cert: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold">
                  {cert.title}
                </h3>

                <p className="text-sm mt-1">
                  {cert.date}
                </p>

                <p className="text-sm">
                  {cert.provider}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AWARDS */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold border-b border-white pb-2">
            Awards & Recognition
          </h2>

          <div className="space-y-5 mt-5">
            {awards?.map((award: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold">
                  {award.title}
                </h3>

                <p className="text-sm mt-1">
                  {award.date}
                </p>

                <p className="text-sm">
                  {award.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* LANGUAGES */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold border-b border-white pb-2">
            Languages
          </h2>

          <div className="space-y-3 mt-5">
            {languages?.map((lang: any, index: number) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <span>{lang.language}</span>
                <span>{lang.level}</span>
              </div>
            ))}
          </div>
        </section>

        {/* INTERESTS */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold border-b border-white pb-2">
            Interests
          </h2>

          <ul className="mt-5 space-y-3 text-sm leading-6">
            {interests?.map((interest: string, index: number) => (
              <li key={index}>{interest}</li>
            ))}
          </ul>
        </section>

      </aside>
    </div>
  );
};

export default Template8;