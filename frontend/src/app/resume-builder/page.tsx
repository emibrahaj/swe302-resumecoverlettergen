"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";

type Education = {
  degree: string;
  school: string;
  grade: string;
  year: string;
  description: string;
};

type Experience = {
  jobTitle: string;
  company: string;
  employmentType: string;
  location: string;
  description: string;
};

type Project = {
  name: string;
  link: string;
  description: string;
};

type Language = {
  name: string;
  level: string;
};

export default function ResumeBuilderPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    address: "",
    zipCode: "",
    profile: "",
  });

  const [education, setEducation] = useState<Education[]>([
    { degree: "", school: "", grade: "", year: "", description: "" },
  ]);

  const [experience, setExperience] = useState<Experience[]>([
    {
      jobTitle: "",
      company: "",
      employmentType: "",
      location: "",
      description: "",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { name: "", link: "", description: "" },
  ]);

  const [languages, setLanguages] = useState<Language[]>([
    { name: "", level: "" },
  ]);

  const [skills, setSkills] = useState<string[]>([
    "Creativity",
    "Decision making",
  ]);

  const [skillInput, setSkillInput] = useState("");

  const inputStyle =
    "w-full border-b border-gray-400 p-2 outline-none focus:border-[#924CCA]";

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: "", school: "", grade: "", year: "", description: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        jobTitle: "",
        company: "",
        employmentType: "",
        location: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleProjectChange = (
    index: number,
    field: keyof Project,
    value: string
  ) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addProject = () => {
    setProjects([...projects, { name: "", link: "", description: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (
    index: number,
    field: keyof Language,
    value: string
  ) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const addLanguage = () => {
    setLanguages([...languages, { name: "", level: "" }]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim() === "") return;
    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="min-h-screen bg-[rgba(226,190,255,0.11)] px-8 py-12 shadow-[inset_0_0_15px_4px_#924CCA]">
        <h1 className="mb-10 text-[42px] font-bold">
          Fill out personal information
        </h1>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Personal Info ✎
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <input name="firstName" value={form.firstName} onChange={handleFormChange} className={inputStyle} placeholder="First Name" />
                <input name="lastName" value={form.lastName} onChange={handleFormChange} className={inputStyle} placeholder="Last Name" />
                <input name="email" value={form.email} onChange={handleFormChange} className={inputStyle} placeholder="Email" />
                <input name="phone" value={form.phone} onChange={handleFormChange} className={inputStyle} placeholder="Phone" />
                <input name="city" value={form.city} onChange={handleFormChange} className={inputStyle} placeholder="City" />
                <input name="country" value={form.country} onChange={handleFormChange} className={inputStyle} placeholder="Country" />
                <input name="address" value={form.address} onChange={handleFormChange} className={inputStyle} placeholder="Address" />
                <input name="zipCode" value={form.zipCode} onChange={handleFormChange} className={inputStyle} placeholder="Zip Code" />
              </div>

              <textarea
                name="profile"
                value={form.profile}
                onChange={handleFormChange}
                className="mt-6 h-28 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#924CCA]"
                placeholder="Profile summary"
              />
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Education ✎
              </h2>

              {education.map((edu, index) => (
                <div key={index} className="mb-8 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#924CCA]">
                      Education {index + 1}
                    </h3>

                    {education.length > 1 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-600 transition active:scale-95"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <input value={edu.degree} onChange={(e) => handleEducationChange(index, "degree", e.target.value)} className={inputStyle} placeholder="Degree" />
                    <input value={edu.school} onChange={(e) => handleEducationChange(index, "school", e.target.value)} className={inputStyle} placeholder="School" />
                    <input value={edu.grade} onChange={(e) => handleEducationChange(index, "grade", e.target.value)} className={inputStyle} placeholder="Grade" />
                    <input value={edu.year} onChange={(e) => handleEducationChange(index, "year", e.target.value)} className={inputStyle} placeholder="Year" />
                  </div>

                  <textarea
                    value={edu.description}
                    onChange={(e) =>
                      handleEducationChange(index, "description", e.target.value)
                    }
                    className="mt-6 h-28 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#924CCA]"
                    placeholder="Enter Description"
                  />
                </div>
              ))}

              <button
                onClick={addEducation}
                className="font-bold text-[#924CCA] transition active:scale-95"
              >
                + Add education
              </button>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Experience ✎
              </h2>

              {experience.map((exp, index) => (
                <div key={index} className="mb-8 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#924CCA]">
                      Experience {index + 1}
                    </h3>

                    {experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-600 transition active:scale-95"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <input value={exp.jobTitle} onChange={(e) => handleExperienceChange(index, "jobTitle", e.target.value)} className={inputStyle} placeholder="Title" />
                    <input value={exp.company} onChange={(e) => handleExperienceChange(index, "company", e.target.value)} className={inputStyle} placeholder="Company" />
                    <input value={exp.employmentType} onChange={(e) => handleExperienceChange(index, "employmentType", e.target.value)} className={inputStyle} placeholder="Employment Type" />
                    <input value={exp.location} onChange={(e) => handleExperienceChange(index, "location", e.target.value)} className={inputStyle} placeholder="Location" />
                  </div>

                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleExperienceChange(index, "description", e.target.value)
                    }
                    className="mt-6 h-28 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#924CCA]"
                    placeholder="Enter Description"
                  />
                </div>
              ))}

              <button
                onClick={addExperience}
                className="font-bold text-[#924CCA] transition active:scale-95"
              >
                + Add experience
              </button>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Skills ✎
              </h2>

              <div className="flex gap-3">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 border-b border-gray-400 p-2 outline-none focus:border-[#924CCA]"
                  placeholder="Add a skill"
                />

                <button
                  onClick={addSkill}
                  className="rounded-lg bg-[#924CCA] px-5 py-2 font-bold text-white transition hover:bg-[#7a3bb0] active:scale-95"
                >
                  Add
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="rounded-full bg-[#eadcff] px-4 py-2 transition hover:bg-[#d8b8ff] active:scale-95"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Projects
              </h2>

              {projects.map((project, index) => (
                <div key={index} className="mb-8 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#924CCA]">
                      Project {index + 1}
                    </h3>

                    {projects.length > 1 && (
                      <button
                        onClick={() => removeProject(index)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-600 transition active:scale-95"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    value={project.name}
                    onChange={(e) =>
                      handleProjectChange(index, "name", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="Project Name"
                  />

                  <input
                    value={project.link}
                    onChange={(e) =>
                      handleProjectChange(index, "link", e.target.value)
                    }
                    className={`${inputStyle} mt-4`}
                    placeholder="🔗 Link"
                  />

                  <textarea
                    value={project.description}
                    onChange={(e) =>
                      handleProjectChange(index, "description", e.target.value)
                    }
                    className="mt-6 h-28 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#924CCA]"
                    placeholder="Project Description"
                  />
                </div>
              ))}

              <button
                onClick={addProject}
                className="font-bold text-[#924CCA] transition active:scale-95"
              >
                + Add project
              </button>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Languages ✎
              </h2>

              {languages.map((language, index) => (
                <div key={index} className="mb-5 rounded-lg border border-gray-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#924CCA]">
                      Language {index + 1}
                    </h3>

                    {languages.length > 1 && (
                      <button
                        onClick={() => removeLanguage(index)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-600 transition active:scale-95"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <input
                      value={language.name}
                      onChange={(e) =>
                        handleLanguageChange(index, "name", e.target.value)
                      }
                      className={inputStyle}
                      placeholder="Language"
                    />

                    <input
                      value={language.level}
                      onChange={(e) =>
                        handleLanguageChange(index, "level", e.target.value)
                      }
                      className={inputStyle}
                      placeholder="Level"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addLanguage}
                className="font-bold text-[#924CCA] transition active:scale-95"
              >
                + Add language
              </button>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h2 className="mb-5 border-b pb-4 text-xl font-bold">
                Add Category
              </h2>

              <div className="grid grid-cols-3 gap-5">
              {["Hobbies", "Certificates", "Conference", "Courses", "+ Other"].map(
                  (item) => (
                    <button
                      key={item}
                      className="rounded-full bg-[#eadcff] px-6 py-3 transition hover:bg-[#d8b8ff] active:scale-95"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="sticky top-28 h-fit">
            <div className="mx-auto flex w-[520px] bg-white shadow-lg">
              <div className="w-[180px] bg-[#55406f] p-6 text-white">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-300" />

                <h3 className="text-center text-xl font-bold">
                  {form.firstName || form.lastName
                    ? `${form.firstName} ${form.lastName}`
                    : "John Smith"}
                </h3>

                <p className="text-center text-sm">
                  {experience[0]?.jobTitle || "Software Engineer"}
                </p>

                <h4 className="mt-10 font-bold">CONTACT</h4>
                <p className="mt-4 text-sm">
                  {form.email || "johnsmith@gmail.com"}
                </p>
                <p className="text-sm">{form.phone || "+355 68 445 6987"}</p>
                <p className="text-sm">
                  {form.city || form.country
                    ? `${form.city} ${form.country}`
                    : "Tirana, Albania"}
                </p>

                <h4 className="mt-10 font-bold">SKILLS</h4>
                <ul className="mt-4 list-disc pl-4 text-sm">
                  {skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>

                <h4 className="mt-10 font-bold">LANGUAGES</h4>
                <ul className="mt-4 list-disc pl-4 text-sm">
                  {languages.map((language, index) => (
                    <li key={index}>
                      {language.name || "Language"}:{" "}
                      {language.level || "Level"}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 p-6 text-sm">
                <h4 className="font-bold">PROFILE</h4>
                <p className="mt-2">
                  {form.profile ||
                    "I am a Software Engineer with experience in multiple programming languages such as Python, Java, Kotlin, and C++."}
                </p>

                <hr className="my-5 border-[#55406f]" />

                <h4 className="font-bold">EDUCATION</h4>
                {education.map((edu, index) => (
                  <div key={index} className="mt-3">
                    <p className="font-bold">{edu.degree || "Degree Title"}</p>
                    <p>{edu.school || "University Name"}</p>
                    <p>{edu.year || "Year"}</p>
                    <p className="mt-1">
                      {edu.description || "Add other specifications here."}
                    </p>
                  </div>
                ))}

                <hr className="my-5 border-[#55406f]" />

                <h4 className="font-bold">WORK EXPERIENCE</h4>
                {experience.map((exp, index) => (
                  <div key={index} className="mt-3">
                    <p className="font-bold">
                      {exp.jobTitle || "Job Position"}
                    </p>
                    <p>{exp.company || "Company Name"}</p>
                    <p>{exp.location || "Location"}</p>
                    <p className="mt-1">
                      {exp.description || "A description of your role."}
                    </p>
                  </div>
                ))}

                <hr className="my-5 border-[#55406f]" />

                <h4 className="font-bold">PROJECTS</h4>
                {projects.map((project, index) => (
                  <div key={index} className="mt-3">
                    <p className="font-bold">{project.name || "Project Name"}</p>
                    <p className="mt-1">
                      {project.description ||
                        "Add a short description of your project."}
                    </p>
                    <p className="mt-1 text-[#924CCA]">
                      {project.link || "Project link"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button className="mx-auto mt-10 block rounded-xl bg-[#924CCA] px-16 py-5 text-2xl font-bold text-white transition hover:bg-[#7a3bb0] hover:shadow-lg active:scale-95 active:shadow-inner">
              Generate CV
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}