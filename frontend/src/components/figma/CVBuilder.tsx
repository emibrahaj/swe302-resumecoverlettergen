"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  Save,
  Eye,
  Palette,
  Type,
  Plus,
  Trash2,
  Upload,
  User,
  GripVertical,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";
import { ResumePreview, type CVData } from "./ResumePreview";
import { useTemplate, useTemplates } from "@/src/hooks/useTemplates";
// ─── Valid keys understood by TEMPLATE_MAP in ResumePreview ─────────────────
const VALID_TEMPLATE_KEYS = new Set([
  "1","2","3","4","5","6","7","8","9","10",
  "template1","template2","template3","template4","template5",
  "template6","template7","template8","template9","template10",
  "template11","template12",
]);

// ─── Types ───────────────────────────────────────────────────────────────────

interface CVBuilderProps {
  templateId: string;
  onBack: () => void;
}

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CustomSection {
  id: string;
  title: string;
  items: string[];
}

type BuiltInSectionId = "experience" | "education" | "skills" | "projects";
type SectionId = BuiltInSectionId | string;

const BUILT_IN_ORDER: SectionId[] = [
  "experience",
  "education",
  "skills",
  "projects",
];

function reorder<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
  if (toIdx < 0 || toIdx >= arr.length) return arr;

  const next = [...arr];
  const [item] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, item);

  return next;
}

const GOOGLE_FONT_URLS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
  Lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap",
};

const FONT_CSS: Record<string, string> = {
  Inter: '"Inter", sans-serif',
  Roboto: '"Roboto", sans-serif',
  "Open Sans": '"Open Sans", sans-serif',
  Lato: '"Lato", sans-serif',
  Montserrat: '"Montserrat", sans-serif',
};

export function CVBuilder({ templateId }: CVBuilderProps) {
  const [activeTab, setActiveTab] = useState<"content" | "design">("content");
  const [cvPhoto, setCvPhoto] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    summary: "",
  });

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      id: "1",
      title: "Software Engineer",
      company: "Tech Company",
      location: "San Francisco, CA",
      startDate: "2023",
      endDate: "Present",
      description:
        "Developed and maintained web applications using React and Node.js",
    },
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      degree: "Bachelor of Computer Science",
      school: "University Name",
      year: "2023",
    },
  ]);

  const [skills, setSkills] = useState<string[]>([
    "JavaScript",
    "React",
    "TypeScript",
    "Node.js",
  ]);

  const [newSkill, setNewSkill] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [aiEnhancing, setAiEnhancing] = useState(false);

  const [sectionOrder, setSectionOrder] =
    useState<SectionId[]>(BUILT_IN_ORDER);

  const COLORS = [
    "#088395",
    "#6366f1",
    "#ec4899",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  const FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat"];

  const [accentColor, setAccentColor] = useState("#088395");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [layout, setLayout] = useState<"single" | "two">("single");

  // ── Resolve template from DB ─────────────────────────────────────────────
  // templateId is the URL slug (e.g. "simple_pink"). We fetch its style_config
  // to (a) set the initial accent colour + font and (b) find the React component key.
  const { template: dbTemplate } = useTemplate(templateId);
  const { templates: allTemplates } = useTemplates();
  const [resolvedTemplateKey, setResolvedTemplateKey] = useState(templateId);

  useEffect(() => {
    if (!dbTemplate) {
      // Direct fallback: if templateId itself is already a valid TEMPLATE_MAP key, use it
      if (VALID_TEMPLATE_KEYS.has(templateId)) {
        setResolvedTemplateKey(templateId);
      }
      return;
    }
    const sc = dbTemplate.style_config;
    if (sc.primaryColor)
        setAccentColor(sc.primaryColor);
    if (sc.fontFamily && sc.fontFamily in GOOGLE_FONT_URLS)
        setFontFamily(sc.fontFamily);
    if (sc.templateKey) setResolvedTemplateKey(sc.templateKey);
  }, [dbTemplate, templateId]);

  useEffect(() => {
    const url = GOOGLE_FONT_URLS[fontFamily];

    if (!url) return;

    const linkId = `gfont-${fontFamily.replaceAll(/\s+/g, "-")}`;

    if (document.getElementById(linkId)) return;

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = url;

    document.head.appendChild(link);
  }, [fontFamily]);

  const dragId = useRef<SectionId | null>(null);
  const [dragOverId, setDragOverId] = useState<SectionId | null>(null);

  const handleDragStart = (id: SectionId) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: SectionId) => {
    e.preventDefault();

    if (dragId.current && dragId.current !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (targetId: SectionId) => {
    const src = dragId.current;

    if (!src || src === targetId) {
      dragId.current = null;
      setDragOverId(null);
      return;
    }

    const fromIdx = sectionOrder.indexOf(src);
    const toIdx = sectionOrder.indexOf(targetId);

    setSectionOrder(reorder(sectionOrder, fromIdx, toIdx));

    dragId.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    dragId.current = null;
    setDragOverId(null);
  };

  const moveSection = (id: SectionId, direction: -1 | 1) => {
    const idx = sectionOrder.indexOf(id);
    setSectionOrder(reorder(sectionOrder, idx, idx + direction));
  };

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const updateWorkExperience = (
    id: string,
    field: keyof WorkExperience,
    value: string
  ) => {
    setWorkExperience(
      workExperience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter((exp) => exp.id !== id));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString(),
        degree: "",
        school: "",
        year: "",
      },
    ]);
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string
  ) => {
    setEducation(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;

    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        name: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const updateProject = (
    id: string,
    field: keyof Project,
    value: string
  ) => {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const addCustomSection = (title: string) => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) return;
  if (customSections.find((section) => section.title === trimmedTitle)) return;

  const id = crypto.randomUUID();

  setCustomSections((prev) => [
    ...prev,
    {
      id,
      title: trimmedTitle,
      items: [""],
    },
  ]);

  setSectionOrder((prev) => [...prev, id]);
};

  const removeCustomSection = (id: string) => {
    setCustomSections(customSections.filter((section) => section.id !== id));
    setSectionOrder(sectionOrder.filter((sectionId) => sectionId !== id));
  };

  const updateCustomItem = (
    sectionId: string,
    index: number,
    value: string
  ) => {
    setCustomSections(
      customSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item, i) =>
                i === index ? value : item
              ),
            }
          : section
      )
    );
  };

  const addCustomItem = (sectionId: string) => {
    setCustomSections(
      customSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [...section.items, ""],
            }
          : section
      )
    );
  };

  const removeCustomItem = (sectionId: string, index: number) => {
    setCustomSections(
      customSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((_, i) => i !== index),
            }
          : section
      )
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setCvPhoto(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleAiEnhance = () => {
    setAiEnhancing(true);

    setTimeout(() => {
      setAiEnhancing(false);
    }, 2000);
  };

  const sectionLabel = (id: SectionId): string => {
    if (id === "experience") return "Work Experience";
    if (id === "education") return "Education";
    if (id === "skills") return "Skills";
    if (id === "projects") return "Projects";

    return customSections.find((section) => section.id === id)?.title ?? "";
  };

  const renderSectionWrapper = ({
    id,
    children,
    addButton,
  }: {
    id: SectionId;
    children: React.ReactNode;
    addButton?: React.ReactNode;
  }) => {
    const idx = sectionOrder.indexOf(id);
    const isOver = dragOverId === id;

    return (
      <div
        key={id}
        onDragOver={(e) => handleDragOver(e, id)}
        onDrop={() => handleDrop(id)}
        onDragEnd={handleDragEnd}
        className={`bg-white rounded-xl border-2 transition-colors ${
          isOver ? "border-[#088395] shadow-md" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div
              draggable
              onDragStart={() => handleDragStart(id)}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#088395] transition-colors"
              title="Drag to reorder"
            >
              <GripVertical size={16} />
            </div>

            <h3 className="font-semibold text-sm">{sectionLabel(id)}</h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveSection(id, -1)}
              disabled={idx === 0}
              title="Move up"
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => moveSection(id, 1)}
              disabled={idx === sectionOrder.length - 1}
              title="Move down"
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown size={14} />
            </button>

            {addButton}
          </div>
        </div>

        <div className="p-4">{children}</div>
      </div>
    );
  };

  const renderEditorSection = (id: SectionId) => {
    if (id === "experience") {
      return renderSectionWrapper({
        id,
        addButton: (
          <button
            type="button"
            onClick={addWorkExperience}
            className="flex items-center gap-1 text-xs text-[#088395] hover:text-teal-700 ml-1"
          >
            <Plus size={14} /> Add
          </button>
        ),
        children: (
          <>
            {workExperience.map((exp) => (
              <div
                key={exp.id}
                className="space-y-3 p-4 bg-gray-50 rounded-lg mb-3 border border-gray-100"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) =>
                      updateWorkExperience(exp.id, "title", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => removeWorkExperience(exp.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    updateWorkExperience(exp.id, "company", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                />

                <input
                  type="text"
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) =>
                    updateWorkExperience(exp.id, "location", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateWorkExperience(
                        exp.id,
                        "startDate",
                        e.target.value
                      )
                    }
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                  />

                  <input
                    type="text"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateWorkExperience(exp.id, "endDate", e.target.value)
                    }
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                  />
                </div>

                <textarea
                  placeholder="Description"
                  value={exp.description}
                  rows={3}
                  onChange={(e) =>
                    updateWorkExperience(
                      exp.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none text-sm"
                />
              </div>
            ))}
          </>
        ),
      });
    }

    if (id === "education") {
      return renderSectionWrapper({
        id,
        addButton: (
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center gap-1 text-xs text-[#088395] hover:text-teal-700 ml-1"
          >
            <Plus size={14} /> Add
          </button>
        ),
        children: (
          <>
            {education.map((edu) => (
              <div
                key={edu.id}
                className="space-y-3 p-4 bg-gray-50 rounded-lg mb-3 border border-gray-100"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) =>
                    updateEducation(edu.id, "school", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                />

                <input
                  type="text"
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) =>
                    updateEducation(edu.id, "year", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                />
              </div>
            ))}
          </>
        ),
      });
    }

    if (id === "skills") {
      return renderSectionWrapper({
        id,
        children: (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  className="px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full flex items-center gap-2 text-sm"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
              />

              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                Add
              </button>
            </div>
          </>
        ),
      });
    }

    if (id === "projects") {
      return renderSectionWrapper({
        id,
        addButton: (
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-1 text-xs text-[#088395] hover:text-teal-700 ml-1"
          >
            <Plus size={14} /> Add
          </button>
        ),
        children:
          projects.length === 0 ? (
            <p className="text-gray-400 text-sm">No projects added yet</p>
          ) : (
            <>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="space-y-3 p-4 bg-gray-50 rounded-lg mb-3 border border-gray-100"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={project.name}
                      onChange={(e) =>
                        updateProject(project.id, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeProject(project.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={project.startDate}
                      onChange={(e) =>
                        updateProject(
                          project.id,
                          "startDate",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                    />

                    <input
                      type="text"
                      placeholder="End Date"
                      value={project.endDate}
                      onChange={(e) =>
                        updateProject(project.id, "endDate", e.target.value)
                      }
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                    />
                  </div>

                  <textarea
                    placeholder="Project Description"
                    value={project.description}
                    rows={3}
                    onChange={(e) =>
                      updateProject(
                        project.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none text-sm"
                  />
                </div>
              ))}
            </>
          ),
      });
    }

    const section = customSections.find((customSection) => customSection.id === id);

    if (!section) return null;

    return renderSectionWrapper({
      id,
      addButton: (
        <button
          type="button"
          onClick={() => removeCustomSection(id)}
          className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
          title="Remove section"
        >
          <Trash2 size={14} />
        </button>
      ),
      children: (
        <>
          {section.items.map((item, index) => (
            <div key={`${section.id}-${index}`} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={`Add ${section.title.toLowerCase()} item`}
                value={item}
                onChange={(e) => updateCustomItem(id, index, e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
              />

              <button
                type="button"
                onClick={() => removeCustomItem(id, index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addCustomItem(id)}
            className="text-sm text-[#088395] hover:text-teal-700 flex items-center gap-1 mt-1"
          >
            <Plus size={13} /> Add {section.title.toLowerCase()} item
          </button>
        </>
      ),
    });
  };

  // ── Switch the active template (called from the picker in Design tab) ───────
  const handleTemplateSwitch = (tpl: (typeof allTemplates)[0]) => {
    const sc = tpl.style_config;
    const key = sc.templateKey ?? tpl.template_key;
    if (key) setResolvedTemplateKey(key);
    if (sc.primaryColor) setAccentColor(sc.primaryColor);
    if (sc.fontFamily && sc.fontFamily in GOOGLE_FONT_URLS) setFontFamily(sc.fontFamily);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
                      <h1 className="text-lg font-semibold text-[#088395]">
                        CV Builder
                      </h1>
                      {(() => {
                        const activeTpl = allTemplates.find(
                          (t) => (t.style_config?.templateKey ?? t.template_key) === resolvedTemplateKey
                        );
                        return activeTpl ? (
                          <p className="text-xs text-gray-400">Template: {activeTpl.name}</p>
                        ) : null;
                      })()}
                    </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={aiEnhancing}
                className={`flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all ${
                  aiEnhancing ? "opacity-75" : ""
                }`}
              >
                <Sparkles
                  size={16}
                  className={aiEnhancing ? "animate-spin" : ""}
                />
                {aiEnhancing ? "Enhancing..." : "AI Enhance"}
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Save size={16} /> Save
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                {(["content", "design"] as const).map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-semibold capitalize ${
                      activeTab === tab
                        ? "text-[#088395] border-b-2 border-[#088395]"
                        : "text-foreground/70"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "content" ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl border-2 border-gray-200">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <h3 className="font-semibold text-sm text-gray-500">
                          Personal Information
                        </h3>

                        <span className="text-xs text-gray-400 italic">
                          (always first)
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex justify-center mb-2">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                              {cvPhoto ? (
                                <img
                                  src={cvPhoto}
                                  alt="CV"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={28} className="text-gray-400" />
                              )}
                            </div>

                            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#088395] rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors">
                              <Upload size={13} className="text-white" />

                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {[
                          {
                            key: "fullName",
                            placeholder: "Full Name",
                            type: "text",
                          },
                          {
                            key: "email",
                            placeholder: "Email",
                            type: "email",
                          },
                          {
                            key: "phone",
                            placeholder: "Phone",
                            type: "tel",
                          },
                          {
                            key: "location",
                            placeholder: "Location",
                            type: "text",
                          },
                          {
                            key: "title",
                            placeholder: "Professional Title",
                            type: "text",
                          },
                        ].map(({ key, placeholder, type }) => (
                          <input
                            key={key}
                            type={type}
                            placeholder={placeholder}
                            value={
                              (personalInfo as Record<string, string>)[key]
                            }
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                [key]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                          />
                        ))}

                        <textarea
                          placeholder="Professional Summary"
                          value={personalInfo.summary}
                          rows={3}
                          onChange={(e) =>
                            setPersonalInfo({
                              ...personalInfo,
                              summary: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none text-sm"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 flex items-center gap-1 px-1">
                      <GripVertical size={12} />
                      Drag the grip handle or use ↑ ↓ to reorder sections
                    </p>

                    {sectionOrder.map((id) => renderEditorSection(id))}

                    <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                      <h3 className="font-semibold text-sm mb-3">
                        Add Category
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {[
                          "Languages",
                          "Hobbies",
                          "Certificates",
                          "Conferences",
                          "Courses",
                        ].map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => addCustomSection(cat)}
                            disabled={customSections.some(
                              (section) => section.title === cat
                            )}
                            className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-colors ${
                              customSections.some(
                                (section) => section.title === cat
                              )
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-[#088395]/30 text-[#088395] hover:bg-[#088395]/5"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const title = prompt("Section name:");
                            if (title) addCustomSection(title);
                          }}
                          className="px-3 py-1.5 rounded-lg border-2 border-[#088395]/30 text-[#088395] hover:bg-[#088395]/5 text-sm"
                        >
                          + Other
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ── Template Picker ─────────────────────────────── */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <LayoutGrid size={20} /> Template
                      </h3>
                      {allTemplates.length === 0 ? (
                        <p className="text-sm text-gray-400">Loading templates…</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                          {allTemplates.map((tpl) => {
                            const tplKey = tpl.style_config?.templateKey ?? tpl.template_key;
                            const isActive = resolvedTemplateKey === tplKey;
                            return (
                              <button
                                key={tpl.template_key}
                                type="button"
                                onClick={() => handleTemplateSwitch(tpl)}
                                className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                                  isActive
                                    ? "border-[#088395] shadow-md ring-2 ring-[#088395]/30"
                                    : "border-gray-200 hover:border-[#088395]/60 hover:shadow-sm"
                                }`}
                              >
                                {/* Thumbnail */}
                                <div
                                  className="aspect-[8.5/11] w-full overflow-hidden"
                                  style={{ background: `linear-gradient(135deg, ${tpl.style_config?.primaryColor ?? "#088395"}22, ${tpl.style_config?.primaryColor ?? "#088395"}08)` }}
                                >
                                  {tpl.preview_image_url ? (
                                    <img
                                      src={tpl.preview_image_url}
                                      alt={tpl.name}
                                      className="w-full h-full object-cover object-top"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                      <div className="w-8 h-1.5 rounded-full opacity-40" style={{ background: tpl.style_config?.primaryColor ?? "#088395" }} />
                                      <div className="w-full space-y-1 px-1">
                                        {[...Array(4)].map((_, i) => (
                                          <div key={i} className="h-1 rounded-full bg-gray-300" style={{ width: `${70 + (i % 3) * 10}%` }} />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Label */}
                                <div className="px-2 py-1.5 bg-white">
                                  <p className="text-xs font-medium truncate">{tpl.name}</p>
                                </div>
                                {/* Active badge */}
                                {isActive && (
                                  <div className="absolute top-1.5 right-1.5 bg-[#088395] text-white rounded-full p-0.5">
                                    <CheckCircle2 size={12} />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette size={20} /> Color Theme
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {COLORS.map((color) => (
                          <button
                            type="button"
                            key={color}
                            onClick={() => setAccentColor(color)}
                            title={color}
                            className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                              accentColor === color
                                ? "ring-2 ring-offset-2 ring-gray-600 scale-110"
                                : "border-2 border-gray-200"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Type size={20} /> Font Family
                      </h3>

                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none"
                        style={{ borderColor: accentColor }}
                      >
                        {FONTS.map((font) => (
                          <option key={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Layout</h3>

                      <div className="grid grid-cols-2 gap-4">
                        {(["single", "two"] as const).map((selectedLayout) => (
                          <button
                            type="button"
                            key={selectedLayout}
                            onClick={() => setLayout(selectedLayout)}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              layout === selectedLayout
                                ? "bg-gray-50"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                            style={
                              layout === selectedLayout
                                ? { borderColor: accentColor }
                                : {}
                            }
                          >
                            <div className="aspect-[8.5/11] bg-white rounded shadow-sm" />

                            <p className="text-sm mt-2">
                              {selectedLayout === "single"
                                ? "Single Column"
                                : "Two Column"}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Eye size={20} /> Live Preview
                  </h3>
                  {/* Show which template is active */}
                  {(() => {
                    const activeTpl = allTemplates.find(
                      (t) => (t.style_config?.templateKey ?? t.template_key) === resolvedTemplateKey
                    );
                    return activeTpl ? (
                      <p className="text-xs text-gray-400 mt-0.5">{activeTpl.name}</p>
                    ) : null;
                  })()}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("design")}
                  className="text-sm text-[#088395] hover:text-teal-700 flex items-center gap-1"
                >
                  <LayoutGrid size={14} /> Change Template
                </button>
              </div>

              <div className="aspect-[8.5/11] bg-white shadow-2xl rounded-lg p-6 overflow-auto border border-gray-200">
                <ResumePreview
                  templateId={resolvedTemplateKey}
                  data={
                    {
                      personalInfo,
                      cvPhoto,
                      workExperience,
                      education,
                      skills,
                      projects,
                      customSections,
                      sectionOrder,
                      accentColor,
                      fontFamily: FONT_CSS[fontFamily] ?? fontFamily,
                    } as CVData
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}