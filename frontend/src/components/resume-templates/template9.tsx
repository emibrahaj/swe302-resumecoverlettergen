import React from "react";

interface Props {
  resumeData: any;
  styleConfig?: any;
}

const Template9: React.FC<Props> = ({
  resumeData,
  styleConfig,
}) => {
  const {
    personalInfo,
    summary,
    profiles,
    skills,
    certifications,
    experience,
    education,
    projects,
  } = resumeData;

  return (
    <div className="flex min-h-screen bg-white font-serif text-[#1f1f1f]">

      {/* LEFT SIDEBAR */}
      <aside className="w-[28%] bg-[#c6d9e5]">

        {/* TOP BLUE HEADER */}
        <div className="bg-[#1185c4] text-white p-6">

          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt="profile"
              className="w-28 h-28 object-cover"
            />
          )}

          <h1 className="text-4xl font-bold mt-5">
            {personalInfo.fullName}
          </h1>

          <p className="mt-2 leading-7 text-[15px]">
            {personalInfo.jobTitle}
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p>{personalInfo.location}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.email}</p>
            <p>{personalInfo.website}</p>
          </div>
        </div>

        {/* SIDEBAR CONTENT */}
        <div className="p-6">

          {/* PROFILES */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold border-b border-[#1185c4] pb-2">
              Profiles
            </h2>

            <div className="space-y-4 mt-4">
              {profiles?.map((profile: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold">
                    {profile.platform}
                  </h3>

                  <p className="text-sm mt-1">
                    {profile.url}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SKILLS */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold border-b border-[#1185c4] pb-2">
              Skills
            </h2>

            <div className="space-y-6 mt-4">
              {skills?.map((skill: any, index: number) => (
                <div key={index}>
                  <h3 className="font-bold text-lg">
                    {skill.category}
                  </h3>

                  <p className="mt-1">
                    {skill.level}
                  </p>

                  <p className="text-sm mt-2 leading-6">
                    {skill.items}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CERTIFICATIONS */}
          <section>
            <h2 className="text-2xl font-bold border-b border-[#1185c4] pb-2">
              Certifications
            </h2>

            <div className="space-y-5 mt-4">
              {certifications?.map(
                (cert: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-bold">
                      {cert.title}
                    </h3>

                    <p className="text-sm mt-1">
                      {cert.provider}
                    </p>

                    <p className="text-sm">
                      {cert.date}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="w-[72%] p-10">

        {/* SUMMARY */}
        <section className="mb-10">
          <p className="text-[17px] leading-9">
            {summary}
          </p>
        </section>

        {/* EXPERIENCE */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold border-b border-[#7ba6bb] pb-2 mb-6">
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

                    <p className="mt-1 text-lg">
                      {exp.position}
                    </p>

                    <p className="italic text-sm mt-1">
                      {exp.website}
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p className="font-semibold">
                      {exp.startDate} to {exp.endDate}
                    </p>

                    <p>{exp.location}</p>
                  </div>
                </div>

                <ul className="list-disc ml-6 mt-5 space-y-3 text-[15px] leading-7">
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

        {/* EDUCATION */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold border-b border-[#7ba6bb] pb-2 mb-6">
            Education
          </h2>

          {education?.map((edu: any, index: number) => (
            <div
              key={index}
              className="flex justify-between"
            >
              <div>
                <h3 className="text-2xl font-bold">
                  {edu.school}
                </h3>

                <p className="mt-1">
                  {edu.location}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {edu.startDate} to {edu.endDate}
                </p>

                <p>{edu.degree}</p>
              </div>
            </div>
          ))}
        </section>

        {/* PROJECTS */}
        <section>
          <h2 className="text-3xl font-bold border-b border-[#7ba6bb] pb-2 mb-6">
            Projects
          </h2>

          <div className="space-y-8">
            {projects?.map((project: any, index: number) => (
              <div key={index}>
                <h3 className="text-2xl font-bold">
                  {project.title}
                </h3>

                <p className="italic mt-1">
                  {project.role}
                </p>

                <p className="mt-3 text-[15px] leading-7">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
};

export default Template9;