"use client";

import React from "react";
import ResumePage from "./ResumePage";
import {ResumePreview} from "@/src/components/figma/ResumePreview";

interface Props {
    resumeData: any;
    styleConfig?: any;
}

const Template9: React.FC<Props> = ({
                                        resumeData,
                                    }) => {
    const {
        personalInfo,
        summary,
        profiles,
        skills,
        experience,
        education,
        projects,

        languages,
        hobbies,
        conferences,
        certifications,
        courses,
        other,
    } = resumeData;

    return (
        <ResumePage>
            <div
                className="flex h-[1123px] bg-white font-serif text-[#1f1f1f] text-[11px] leading-[1.35]">                {/* LEFT SIDEBAR */}
                <aside className="w-[27%] bg-[#c6d9e5] flex flex-col h-full">
                    {/* HEADER */}
                    <div className="bg-[#1185c4] text-white p-3">

                        {personalInfo?.photoUrl && (
                            <img
                                src={personalInfo.photoUrl}
                                alt="profile"
                                className="w-20 h-20 object-cover"
                            />
                        )}

                        <h1 className="text-xl font-bold mt-3 leading-tight">
                            {personalInfo?.fullName}
                        </h1>

                        <p className="mt-1 text-[11px] leading-4">
                            {personalInfo?.jobTitle}
                        </p>

                        <div className="mt-3 space-y-1 text-[10px] leading-4 break-words">

                            {personalInfo?.location && (
                                <p>{personalInfo.location}</p>
                            )}

                            {personalInfo?.phone && (
                                <p>{personalInfo.phone}</p>
                            )}

                            {personalInfo?.email && (
                                <p>{personalInfo.email}</p>
                            )}

                            {personalInfo?.website && (
                                <p>{personalInfo.website}</p>
                            )}

                        </div>
                    </div>

                    {/* SIDEBAR CONTENT */}
                    <div className="p-3 flex-1">
                        {/* PROFILES */}
                        {profiles?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Profiles
                                </h2>

                                <div className="space-y-2 mt-2">
                                    {profiles.map((profile: any, index: number) => (
                                        <div key={index}>
                                            <h3 className="font-semibold text-[11px]">
                                                {profile.platform}
                                            </h3>

                                            <p className="text-[10px] mt-1 break-words">
                                                {profile.url}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SKILLS */}
                        {skills?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Skills
                                </h2>

                                <div className="space-y-3 mt-2">
                                    {skills.map((skill: any, index: number) => (
                                        <div key={index}>

                                            {skill.level && (
                                                <p className="text-[10px] mt-1">
                                                    {skill.level}
                                                </p>
                                            )}

                                            <p className="text-[10px] mt-1 leading-4">
                                                {Array.isArray(skill.items)
                                                    ? skill.items.join(", ")
                                                    : skill.items || ""}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* CERTIFICATIONS */}
                        {certifications?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Certifications
                                </h2>

                                <div className="space-y-3 mt-2">
                                    {certifications.map(
                                        (cert: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="font-semibold text-[11px]">
                                                    {cert.title}
                                                </h3>

                                                <p className="text-[10px] mt-1">
                                                    {cert.provider}
                                                </p>

                                                <p className="text-[10px]">
                                                    {cert.date}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {/* LANGUAGES */}
                        {languages?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Languages
                                </h2>

                                <div className="space-y-2 mt-2">
                                    {languages.map((lang: any, index: number) => (
                                        <div key={index}>

                                            <p className="text-[11px] font-semibold">
                                                {typeof lang === "string"
                                                    ? lang
                                                    : lang.language ||
                                                    lang.name ||
                                                    "Language"}
                                            </p>

                                            {(lang.level ||
                                                lang.proficiency) && (
                                                <p className="text-[10px] leading-4">
                                                    {lang.level ||
                                                        lang.proficiency}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* HOBBIES */}
                        {hobbies?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Hobbies
                                </h2>

                                <ul className="list-disc ml-4 mt-2 space-y-1 text-[10px] leading-4">
                                    {hobbies.map((hobby: any, index: number) => (
                                        <li key={index}>
                                            {typeof hobby === "string"
                                                ? hobby
                                                : hobby.name ||
                                                hobby.title ||
                                                "Hobby"}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* CONFERENCES */}
                        {conferences?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Conferences
                                </h2>

                                <div className="space-y-2 mt-2">
                                    {conferences.map((conference: any, index: number) => (
                                        <div key={index}>

                                            <p className="text-[11px] font-semibold">
                                                {conference.title ||
                                                    conference.name }
                                            </p>

                                            {(conference.organizer ||
                                                conference.location) && (
                                                <p className="text-[10px] leading-4">
                                                    {[conference.organizer, conference.location]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </p>
                                            )}

                                            {conference.date && (
                                                <p className="text-[10px]">
                                                    {conference.date}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* COURSES */}
                        {courses?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Courses
                                </h2>

                                <div className="space-y-2 mt-2">
                                    {courses.map((course: any, index: number) => (
                                        <div key={index}>

                                            <p className="text-[11px] font-semibold">
                                                {course.title ||
                                                    course.name }
                                            </p>

                                            {(course.provider ||
                                                course.platform) && (
                                                <p className="text-[10px] leading-4">
                                                    {course.provider ||
                                                        course.platform}
                                                </p>
                                            )}

                                            {course.date && (
                                                <p className="text-[10px]">
                                                    {course.date}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                         {/* COURSES */}
                        {certifications?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Certificates
                                </h2>

                                <div className="space-y-2 mt-2">
                                    {courses.map((certifications: any, index: number) => (
                                        <div key={index}>

                                            <p className="text-[11px] font-semibold">
                                                {certifications.title ||
                                                    certifications.name }
                                            </p>

                                            {(certifications.provider ||
                                                certifications.platform) && (
                                                <p className="text-[10px] leading-4">
                                                    {certifications.provider ||
                                                        certifications.platform}
                                                </p>
                                            )}

                                            {certifications.date && (
                                                <p className="text-[10px]">
                                                    {certifications.date}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}


                        {/* OTHER */}
                        {other?.length > 0 && (
                            <section>
                                <h2 className="text-[15px] font-bold border-b border-[#1185c4] pb-1">
                                    Additional Information
                                </h2>

                                <ul className="list-disc ml-4 mt-2 space-y-1 text-[10px] leading-4">
                                    {other.map((item: any, index: number) => (
                                        <li key={index}>
                                            {typeof item === "string"
                                                ? item
                                                : item.value ||
                                                item.title ||
                                                item.name ||
                                                "Additional Item"}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="w-[73%] p-5">

                    {/* SUMMARY */}
                    {summary && (
                        <section className="mb-4">
                            <p className="text-[11px] leading-5">
                                {summary}
                            </p>
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    {experience?.length > 0 && (
                        <section className="mb-4">
                            <h2 className="text-[15px] font-bold border-b border-[#7ba6bb] pb-1 mb-3">
                                Experience
                            </h2>

                            <div className="space-y-3">
                                {experience.map((exp: any, index: number) => (
                                    <div key={index}>

                                        <div className="flex justify-between gap-2">
                                            <div className="flex-1">
                                                <h3 className="text-[13px] font-bold">
                                                    {exp.company}
                                                </h3>

                                                <p className="mt-1 text-[11px]">
                                                    {exp.position}
                                                </p>

                                                {exp.website && (
                                                    <p className="italic text-[10px] mt-1 break-words">
                                                        {exp.website}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-right text-[10px] shrink-0">
                                                <p className="font-semibold">
                                                    {exp.startDate} to {exp.endDate}
                                                </p>

                                                <p>{exp.location}</p>
                                            </div>
                                        </div>

                                        {exp.bullets?.length > 0 && (
                                            <ul className="list-disc ml-4 mt-2 space-y-1 text-[11px] leading-4">
                                                {exp.bullets.map(
                                                    (bullet: string, i: number) => (
                                                        <li key={i}>{bullet}</li>
                                                    )
                                                )}
                                            </ul>
                                        )}

                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* EDUCATION */}
                    {education?.length > 0 && (
                        <section className="mb-4">
                            <h2 className="text-[15px] font-bold border-b border-[#7ba6bb] pb-1 mb-3">
                                Education
                            </h2>

                            <div className="space-y-3">
                                {education.map((edu: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex justify-between gap-2"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-[13px] font-bold">
                                                {edu.school}
                                            </h3>

                                            <p className="mt-1 text-[11px]">
                                                {edu.location}
                                            </p>
                                        </div>

                                        <div className="text-right text-[10px] shrink-0">
                                            <p className="font-semibold">
                                                {edu.startDate} to {edu.endDate}
                                            </p>

                                            <p>{edu.degree}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECTS */}
                    {projects?.length > 0 && (
                        <section>
                            <h2 className="text-[15px] font-bold border-b border-[#7ba6bb] pb-1 mb-3">
                                Projects
                            </h2>

                            <div className="space-y-3">
                                {projects.map((project: any, index: number) => (
                                    <div key={index}>
                                        <h3 className="text-[13px] font-bold">
                                            {project.title}
                                        </h3>

                                        {project.role && (
                                            <p className="italic text-[11px] mt-1">
                                                {project.role}
                                            </p>
                                        )}

                                        <p className="mt-1 text-[11px] leading-4">
                                            {project.description}
                                        </p>
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

export default Template9;