import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template12: React.FC<Props> = ({
  resumeData,
}) => {
  const {
    personalInfo,
    summary,
    education,
    experience,
    certifications,
    interests,
  } = resumeData;

  return (
    <div className="min-h-screen bg-white text-[#222] font-serif flex">

      {/* SIDEBAR */}
      <aside className="w-[33%] bg-[#dfe7e8] p-8">

        {/* PROFILE */}
        <div className="text-center">

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-40 h-40 object-cover mx-auto"
            />
          )}

          <h1 className="text-5xl font-bold mt-5">
            {personalInfo.fullName}
          </h1>

          <p className="mt-2 text-[15px] leading-7">
            {personalInfo.jobTitle}
          </p>

        </div>

        {/* CONTACT */}
        <div className="mt-8 border-t border-[#7e9798] pt-6 space-y-3 text-sm">
          <p>{personalInfo.email}</p>
          <p>{personalInfo.phone}</p>
          <p>{personalInfo.location}</p>
          <p>{personalInfo.linkedin}</p>
          <p>{personalInfo.certification}</p>
        </div>

        {/* CERTIFICATIONS */}
        <section className="mt-10">
          <h2 className="text-3xl font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-2">
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

        {/* INTERESTS */}
        <section className="mt-10">
          <h2 className="text-3xl font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-2">
            Interests
          </h2>

          <ul className="mt-5 space-y-5 text-sm leading-7">
            {interests?.map(
              (interest: string, index: number) => (
                <li key={index}>
                  {interest}
                </li>
              )
            )}
          </ul>
        </section>

      </aside>

      {/* MAIN */}
      <main className="w-[67%] p-8">

        {/* ONLINE */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-2">
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

        {/* SUMMARY */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-2">
            Professional Summary
          </h2>

          <p className="mt-4 leading-8 text-[15px]">
            {summary}
          </p>
        </section>

        {/* EDUCATION */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-2">
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
          <h2 className="text-3xl font-bold text-[#4f6d73] border-b border-[#4f6d73] pb-2">
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

export default Template12;