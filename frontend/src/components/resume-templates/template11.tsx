"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
    resumeData: any;
    styleConfig?: any;
}

const Template11: React.FC<Props> = ({resumeData}) => {
    const {
        personalInfo,
        summary,
        skills,
        education,
        experience,
        projects,
        certifications,
        languages,
        courses,
        conferences,
        other,
        extraSections,
    } = resumeData;

    const SideHeader = ({children}: { children: React.ReactNode }) => (
        <h2 className="text-[13px] font-bold text-[var(--rp)] border-b border-[var(--rp)] pb-1 mb-2">{children}</h2>
    );
    const MainHeader = ({children}: { children: React.ReactNode }) => (
        <h2 className="text-[13px] font-bold text-[var(--rp)] border-b border-[var(--rp)] pb-1 mb-2">{children}</h2>
    );

    return (
        <ResumePage>
            <div className="bg-[#f6f2f7] text-[#222] flex min-h-[1123px] text-[12.5px] leading-[1.35]" style={{ fontFamily: "var(--rf)" }}>

                {/* LEFT SIDEBAR */}
                <aside className="w-[33%] bg-[var(--rp)] text-white flex flex-col">

                    {/* HEADER */}
                    <div className="p-4 shrink-0">
                        {personalInfo?.photoUrl && (
                            <img src={personalInfo.photoUrl} alt="profile"
                                 className="w-20 h-20 object-cover"/>
                        )}
                        <h1 className="text-[16px] font-bold mt-2 leading-tight">{personalInfo?.fullName}</h1>
                        <p className="mt-0.5 text-[12.5px] leading-4">{personalInfo?.jobTitle}</p>
                        <div className="mt-2 space-y-0.5 text-[11.5px]">
                            {personalInfo?.email && <p>{personalInfo.email}</p>}
                            {personalInfo?.phone && <p>{personalInfo.phone}</p>}
                            {personalInfo?.location && <p>{personalInfo.location}</p>}
                        </div>
                    </div>

                    {/* SIDEBAR CONTENT */}
                    <div className="bg-[#d9c8eb] text-[#222] p-4 flex-1">
                        {/* SKILLS */}
                        {skills?.length > 0 && (
                            <section className="mb-3">
                                <MainHeader>Technical Skills</MainHeader>
                                <p className="text-[12.5px] leading-5">
                                    {skills.map((s: any) =>
                                        Array.isArray(s.items) ? s.items.join(", ") : (s.items || "")
                                    ).filter(Boolean).join(" • ")}
                                </p>
                            </section>
                        )}

                        {/* CERTIFICATIONS */}
                        {certifications?.length > 0 && (
                            <section className="mb-3">
                                <SideHeader>Certifications</SideHeader>
                                <div className="space-y-1.5">
                                    {certifications.map((cert: any, i: number) => (
                                        <div key={i}>
                                            <p className="font-semibold text-[12.5px]">
                                                {typeof cert === "string" ? cert : cert.title || cert.name || ""}
                                            </p>
                                            {cert.provider && <p className="text-[11.5px]">{cert.provider}</p>}
                                            {cert.date && <p className="text-[11.5px]">{cert.date}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* LANGUAGES */}
                        {languages?.length > 0 && (
                            <section className="mb-3">
                                <SideHeader>Languages</SideHeader>
                                <div className="space-y-1">
                                    {languages.map((lang: any, i: number) => (
                                        <p key={i} className="text-[12.5px]">
                                            {typeof lang === "string" ? lang : lang.language || lang.name || ""}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        )}


                        {/* COURSES */}
                        {courses?.length > 0 && (
                            <section className="mb-3">
                                <SideHeader>Courses</SideHeader>
                                <div className="space-y-1">
                                    {courses.map((c: any, i: number) => (
                                        <p key={i}
                                           className="text-[12.5px]">{typeof c === "string" ? c : c.title || c.name || ""}</p>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* CONFERENCES */}
                        {conferences?.length > 0 && (
                            <section className="mb-3">
                                <SideHeader>Conferences</SideHeader>
                                <div className="space-y-1">
                                    {conferences.map((c: any, i: number) => (
                                        <p key={i}
                                           className="text-[12.5px]">{typeof c === "string" ? c : c.title || c.name || ""}</p>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* OTHER */}
                        {other?.length > 0 && (
                            <section className="mb-3">
                                <SideHeader>Additional</SideHeader>
                                <ul className="list-disc ml-3 space-y-0.5 text-[12.5px]">
                                    {other.map((item: any, i: number) => (
                                        <li key={i}>{typeof item === "string" ? item : item.value || item.title || item.name || ""}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* USER-DEFINED CUSTOM SECTIONS (e.g. Training, Awards) */}
                        {extraSections?.map((section: any) => (
                            <section key={section.id} className="mb-3">
                                <SideHeader>{section.title}</SideHeader>
                                <ul className="list-disc ml-3 space-y-0.5 text-[12.5px]">
                                    {(section.items || []).filter((i: string) => (i || "").trim() !== "").map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </section>
                        ))}

                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="w-[67%] p-4">

                    {/* SUMMARY */}
                    {summary && (
                        <section className="mb-3">
                            <p className="text-[12.5px] leading-5">{summary}</p>
                        </section>
                    )}


                    {/* EDUCATION */}
                    {education?.length > 0 && (
                        <section className="mb-3">
                            <MainHeader>Education</MainHeader>
                            <div className="space-y-2">
                                {education.map((edu: any, i: number) => (
                                    <div key={i} className="flex justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-[12px]">{edu.school}</h3>
                                            <p className="text-[12.5px]">{edu.degree}</p>
                                        </div>
                                        <div className="text-right text-[11.5px] shrink-0">
                                            <p>{edu.endDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    {experience?.length > 0 && (
                        <section className="mb-3">
                            <MainHeader>Professional Experience</MainHeader>
                            <div className="space-y-3">
                                {experience.map((exp: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-[12px]">{exp.company}</h3>
                                                <p className="text-[12.5px]">{exp.position}</p>
                                            </div>
                                            <div className="text-right text-[11.5px] shrink-0">
                                                <p>{exp.startDate} – {exp.endDate}</p>
                                                <p>{exp.location}</p>
                                            </div>
                                        </div>
                                        {exp.bullets?.length > 0 && (
                                            <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[12.5px]">
                                                {exp.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECTS */}
                    {projects?.length > 0 && (
                        <section className="mb-3">
                            <MainHeader>Projects</MainHeader>
                            <div className="space-y-2">
                                {projects.map((p: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between gap-2">
                                            <h3 className="font-bold text-[12px]">{p.title}</h3>
                                            {(p.startDate || p.endDate) && (
                                                <span
                                                    className="text-[11.5px] shrink-0">{p.startDate}{p.endDate ? ` – ${p.endDate}` : ""}</span>
                                            )}
                                        </div>
                                        {p.description &&
                                            <p className="text-[12.5px] text-gray-700 mt-0.5">{p.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </main>

            </div>
        </ResumePage>
    );
};

export default Template11;
