"use client";

import React from "react";
import ResumePage from "./ResumePage";

interface Props {
    resumeData: any;
    styleConfig?: any;
}

const Template10: React.FC<Props> = ({
                                         resumeData,
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
        projects,
        hobbies,
        conferences,
        courses,
        other,
        profiles,
    } = resumeData;

    return (
        <ResumePage>
            <div className="h-[1123px] bg-white text-[#222] text-[11px] leading-[1.35] overflow-hidden" style={{ fontFamily: 'var(--rf)' }}>

                {/* TOP HEADER */}
                <div className="text-white px-5 py-4 flex items-center gap-5" style={{ backgroundColor: 'var(--rp)' }}>

                    {personalInfo?.photoUrl && (
                        <img
                            src={personalInfo.photoUrl}
                            alt="profile"
                            className="w-20 h-20 object-cover bg-white shrink-0"
                        />
                    )}

                    <div className="flex-1 min-w-0">

                        <h1 className="text-[24px] font-bold leading-tight">
                            {personalInfo?.fullName}
                        </h1>

                        <p className="mt-1 text-[12px]">
                            {personalInfo?.jobTitle}
                        </p>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-[10px] break-words">
                            {personalInfo?.email && (
                                <p>{personalInfo.email}</p>
                            )}

                            {personalInfo?.phone && (
                                <p>{personalInfo.phone}</p>
                            )}

                            {personalInfo?.location && (
                                <p>{personalInfo.location}</p>
                            )}

                            {personalInfo?.website && (
                                <p>{personalInfo.website}</p>
                            )}

                            {personalInfo?.linkedin && (
                                <p>{personalInfo.linkedin}</p>
                            )}
                        </div>

                    </div>

                </div>

                {/* BODY */}
                <div className="flex h-full">

                    {/* LEFT SIDEBAR */}
                    <aside className="w-[32%] p-4 flex flex-col h-full bg-[#fff7fb]">

                        {/* CERTIFICATIONS */}
                        {certifications?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Certifications
                                </h2>

                                <div className="space-y-3">
                                    {certifications.map((cert: any, index: number) => (
                                        <div key={index}>

                                            <h3 className="font-semibold text-[11px]">
                                                {typeof cert === "string"
                                                    ? cert
                                                    : cert.title ||
                                                    cert.name ||
                                                    "Certification"}
                                            </h3>

                                            {(cert.date || cert.year) && (
                                                <p className="text-[10px] mt-1">
                                                    {cert.date || cert.year}
                                                </p>
                                            )}

                                            {(cert.provider || cert.organization) && (
                                                <p className="text-[10px] mt-1">
                                                    {cert.provider || cert.organization}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {/* AWARDS */}
                        {awards?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Awards
                                </h2>

                                <div className="space-y-3">
                                    {awards.map((award: any, index: number) => (
                                        <div key={index}>
                                            <h3 className="font-semibold text-[11px]">
                                                {award.title}
                                            </h3>

                                            {award.date && (
                                                <p className="text-[10px] mt-1">
                                                    {award.date}
                                                </p>
                                            )}

                                            {award.description && (
                                                <p className="text-[10px] mt-1 leading-4">
                                                    {award.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* LANGUAGES */}
                        {languages?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Languages
                                </h2>

                                <div className="space-y-3">
                                    {languages.map((lang: any, index: number) => (
                                        <div key={index}>

                                            <div className="flex justify-between gap-2">
                        <span className="text-[11px] font-semibold">
                          {typeof lang === "string"
                              ? lang
                              : lang.language ||
                              lang.name ||
                              "Language"}
                        </span>

                                                {(lang.level ||
                                                    lang.proficiency) && (
                                                    <span className="text-[10px]">
                            {lang.level ||
                                lang.proficiency}
                          </span>
                                                )}
                                            </div>

                                            <div className="w-full h-1.5 bg-[#f2d4e5] mt-1">
                                                <div
                                                    className="h-1.5"
                                                    style={{
                                                        width: `${lang.progress || 80}%`,
                                                        backgroundColor: 'var(--rp)',
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* HOBBIES */}
                        {hobbies?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Hobbies
                                </h2>

                                <ul className="list-disc ml-4 space-y-1 text-[10px] leading-4">
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
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Conferences
                                </h2>

                                <div className="space-y-2">
                                    {conferences.map((conference: any, index: number) => (
                                        <div key={index}>

                                            <p className="text-[11px] font-semibold">
                                                {conference.title ||
                                                    conference.name ||
                                                    "Conference"}
                                            </p>

                                            {(conference.organizer ||
                                                conference.location) && (
                                                <p className="text-[10px] leading-4 mt-1">
                                                    {[conference.organizer, conference.location]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </p>
                                            )}

                                            {conference.date && (
                                                <p className="text-[10px] mt-1">
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
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Courses
                                </h2>

                                <div className="space-y-2">
                                    {courses.map((course: any, index: number) => (
                                        <div key={index}>

                                            <p className="text-[11px] font-semibold">
                                                {course.title ||
                                                    course.name ||
                                                    "Course"}
                                            </p>

                                            {(course.provider ||
                                                course.platform) && (
                                                <p className="text-[10px] mt-1">
                                                    {course.provider ||
                                                        course.platform}
                                                </p>
                                            )}

                                            {course.date && (
                                                <p className="text-[10px] mt-1">
                                                    {course.date}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* OTHER */}
                        {other?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Additional Information
                                </h2>

                                <ul className="list-disc ml-4 space-y-1 text-[10px] leading-4">
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

                        {/* INTERESTS */}
                        {interests?.length > 0 && (
                            <section>
                                <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--rp)' }}>
                                    Interests
                                </h2>

                                <ul className="space-y-1 text-[10px] leading-4">
                                    {interests.map(
                                        (interest: any, index: number) => (
                                            <li key={index}>
                                                {typeof interest === "string"
                                                    ? interest
                                                    : interest.name ||
                                                    interest.title ||
                                                    "Interest"}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </section>
                        )}

                    </aside>

                    {/* RIGHT CONTENT */}
                    <main className="w-[68%] p-5 overflow-hidden">

                        {/* ONLINE PRESENCE */}
                        {profiles?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b pb-1" style={{ color: 'var(--rp)', borderColor: 'var(--rp)' }}>
                                    Online Presence
                                </h2>

                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {profiles.map(
                                        (link: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="font-semibold text-[11px]">
                                                    {link.platform}
                                                </h3>

                                                <p className="text-[10px] mt-1 break-words">
                                                    {link.url}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {/* SUMMARY */}
                        {summary && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b pb-1" style={{ color: 'var(--rp)', borderColor: 'var(--rp)' }}>
                                    Professional Summary
                                </h2>

                                <p className="mt-2 leading-5 text-[11px]">
                                    {summary}
                                </p>
                            </section>
                        )}

                        {/* SKILLS */}
                        {skills?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b pb-1" style={{ color: 'var(--rp)', borderColor: 'var(--rp)' }}>
                                    Technical Skills
                                </h2>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-3">

                                    {skills.flatMap((skill: any, index: number) => {

                                        // CASE 1:
                                        // skill.items is array
                                        if (Array.isArray(skill.items)) {
                                            return skill.items.map(
                                                (item: string, i: number) => (
                                                    <div key={`${index}-${i}`}>

                                                        <div className="flex items-start gap-2">

                                                            <div className="text-[10px] mt-[1px]" style={{ color: 'var(--rp)' }}>
                                                                ✧
                                                            </div>

                                                            <div className="flex-1">

                                                                <h3 className="font-bold text-[11px] leading-4">
                                                                    {item}
                                                                </h3>

                                                                <p className="text-[10px] mt-[2px]">
                                                                    {skill.level || "Advanced"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <div className="w-full h-[5px] bg-[#f2d4e5] mt-2">
                                                            <div
                                                                className="h-[5px]"
                                                                style={{
                                                                    width: `${skill.progress || 80}%`,
                                                                    backgroundColor: 'var(--rp)',
                                                                }}
                                                            />
                                                        </div>

                                                    </div>
                                                )
                                            );
                                        }

                                        // CASE 2:
                                        // skill.items is comma string
                                        if (typeof skill.items === "string") {

                                            const splitSkills = skill.items
                                                .split(",")
                                                .map((s: string) => s.trim())
                                                .filter(Boolean);

                                            return splitSkills.map(
                                                (item: string, i: number) => (
                                                    <div key={`${index}-${i}`}>

                                                        <div className="flex items-start gap-2">

                                                            <div className="text-[10px] mt-[1px]" style={{ color: 'var(--rp)' }}>
                                                                ✧
                                                            </div>

                                                            <div className="flex-1">

                                                                <h3 className="font-bold text-[11px] leading-4">
                                                                    {item}
                                                                </h3>

                                                                <p className="text-[10px] mt-[2px]">
                                                                    {skill.level || "Advanced"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <div className="w-full h-[5px] bg-[#f2d4e5] mt-2">
                                                            <div
                                                                className="h-[5px]"
                                                                style={{
                                                                    width: `${skill.progress || 80}%`,
                                                                    backgroundColor: 'var(--rp)',
                                                                }}
                                                            />
                                                        </div>

                                                    </div>
                                                )
                                            );
                                        }

                                        // CASE 3:
                                        // single skill object
                                        return (
                                            <div key={index}>

                                                <div className="flex items-start gap-2">

                                                    <div className="text-[10px] mt-[1px]" style={{ color: 'var(--rp)' }}>
                                                        ✧
                                                    </div>

                                                    <div className="flex-1">

                                                        <h3 className="font-bold text-[11px] leading-4">
                                                            {skill.category || "Skill"}
                                                        </h3>

                                                        <p className="text-[10px] mt-[2px]">
                                                            {skill.level || "Advanced"}
                                                        </p>

                                                    </div>

                                                </div>

                                                {skill.items && (
                                                    <p className="text-[10px] leading-4 mt-2">
                                                        {skill.items}
                                                    </p>
                                                )}

                                                <div className="w-full h-[5px] bg-[#f2d4e5] mt-2">
                                                    <div
                                                        className="h-[5px]"
                                                        style={{
                                                            width: `${skill.progress || 80}%`,
                                                            backgroundColor: 'var(--rp)',
                                                        }}
                                                    />
                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>
                            </section>
                        )}
                        {/* EDUCATION */}
                        {education?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b pb-1" style={{ color: 'var(--rp)', borderColor: 'var(--rp)' }}>
                                    Education
                                </h2>

                                <div className="space-y-3 mt-3">
                                    {education.map((edu: any, index: number) => (
                                        <div key={index}>

                                            <div className="flex justify-between gap-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[12px]">
                                                        {edu.school}
                                                    </h3>

                                                    <p className="text-[11px] mt-1">
                                                        {edu.degree}
                                                    </p>
                                                </div>

                                                <div className="text-right text-[10px] shrink-0">
                                                    {edu.gpa && (
                                                        <p>{edu.gpa}</p>
                                                    )}

                                                    <p>
                                                        {edu.location} • {edu.startDate} - {edu.endDate}
                                                    </p>
                                                </div>
                                            </div>

                                            {edu.description && (
                                                <p className="mt-2 text-[10px] leading-4">
                                                    {edu.description}
                                                </p>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* EXPERIENCE */}
                        {experience?.length > 0 && (
                            <section className="mb-4">
                                <h2 className="text-[15px] font-bold border-b pb-1" style={{ color: 'var(--rp)', borderColor: 'var(--rp)' }}>
                                    Professional Experience
                                </h2>

                                <div className="space-y-4 mt-3">
                                    {experience.map((exp: any, index: number) => (
                                        <div key={index}>

                                            <div className="flex justify-between gap-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[12px]">
                                                        {exp.company}
                                                    </h3>

                                                    <p className="text-[11px] mt-1">
                                                        {exp.position}
                                                    </p>
                                                </div>

                                                <div className="text-right text-[10px] shrink-0">
                                                    <p>{exp.location}</p>

                                                    <p>
                                                        {exp.startDate} - {exp.endDate}
                                                    </p>
                                                </div>
                                            </div>

                                            {exp.bullets?.length > 0 && (
                                                <ul className="list-disc ml-4 mt-2 space-y-1 text-[10px] leading-4">
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

                        {/* PROJECTS */}
                        {projects?.length > 0 && (
                            <section>
                                <h2 className="text-[15px] font-bold border-b pb-1" style={{ color: 'var(--rp)', borderColor: 'var(--rp)' }}>
                                    Projects
                                </h2>

                                <div className="space-y-3 mt-3">
                                    {projects.map((project: any, index: number) => (
                                        <div key={index}>

                                            <h3 className="font-semibold text-[12px]">
                                                {project.title}
                                            </h3>

                                            {project.role && (
                                                <p className="italic text-[10px] mt-1">
                                                    {project.role}
                                                </p>
                                            )}

                                            <p className="mt-1 text-[10px] leading-4">
                                                {project.description}
                                            </p>

                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </main>

                </div>
            </div>
        </ResumePage>
    );
};

export default Template10;