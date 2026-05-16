"use client";

import {useEffect, useRef, useState} from "react";
import {
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    GripVertical,
    Lock,
    Palette,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Type,
    Upload,
    User,
} from "lucide-react";
import {toast} from "sonner";
import {type CVData, ResumePreview} from "./ResumePreview";
import {useResume, useSaveResume} from "@/src/hooks/useResume";
import {useAuth} from "@/src/hooks/useAuth";
import {api, ApiError} from "@/src/lib/api";
import {useModals} from "@/src/context/ModalContext";
import {ResumeStrengthPanel} from "./ResumeStrengthPanel";
import {useTemplate} from "@/src/hooks/useTemplates";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CVBuilderProps {
    templateId: string;
    resumeId?: string;
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

export function CVBuilder({
                              templateId,
                              resumeId: initialResumeId
                          }: CVBuilderProps) {
    const [activeTab, setActiveTab] = useState<"content" | "design">("content");
    const [cvPhoto, setCvPhoto] = useState<string | null>(null);
    const [resumeId, setResumeId] = useState<string | undefined>(initialResumeId);
    const [saving, setSaving] = useState(false);
    const {
        resume: loadedResume,
        loading: loadingResume
    } = useResume(initialResumeId ?? null);
    // ── Fetch the DB template so we can seed design defaults ──────────────────
    const {template: dbTemplate} = useTemplate(templateId);
    const previewTemplateId = dbTemplate?.style_config?.templateKey ?? templateId;

    const FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat"];

    const [accentColor, setAccentColor] = useState("#088395");
    const [fontFamily, setFontFamily] = useState("Inter");
    const [layout, setLayout] = useState<"single" | "two">("single");

    // Seed accentColor and fontFamily from the DB template's style_config
    // (runs once when the template data arrives)
    useEffect(() => {
        if (!dbTemplate) return;
        const {primaryColor, fontFamily: dbFont} = dbTemplate.style_config;
        if (primaryColor)
            setAccentColor(primaryColor);
        if (dbFont && FONTS.includes(dbFont))
            setFontFamily(dbFont);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dbTemplate?.template_key]);          // only re-seed when template changes
    const {save} = useSaveResume();
    const {openLogin, openSignup} = useModals();
    const {isAuthenticated, isLoading: authLoading} = useAuth();
    const showLoginGate = !authLoading && !isAuthenticated;

    const requireAuth = (): boolean => {
        if (typeof window === "undefined") return false;
        const token = window.localStorage.getItem("access_token");
        if (!token) {
            toast.info("Please sign in to use AI features", {duration: 2500});
            openLogin();
            return false;
        }
        return true;
    };


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

    // ── Collapsible sections ──────────────────────────────────────────────────
    const [collapsedSections, setCollapsedSections] = useState<Set<SectionId>>(new Set());

    const toggleSectionCollapse = (id: SectionId) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ── Item-level reorder helpers ────────────────────────────────────────────
    const moveWorkExperience = (id: string, direction: -1 | 1) => {
        const idx = workExperience.findIndex((e) => e.id === id);
        setWorkExperience(reorder(workExperience, idx, idx + direction));
    };

    const moveEducation = (id: string, direction: -1 | 1) => {
        const idx = education.findIndex((e) => e.id === id);
        setEducation(reorder(education, idx, idx + direction));
    };

    const moveProject = (id: string, direction: -1 | 1) => {
        const idx = projects.findIndex((p) => p.id === id);
        setProjects(reorder(projects, idx, idx + direction));
    };

    const COLORS = [
        "#088395",
        "#6366f1",
        "#ec4899",
        "#8b5cf6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
    ];

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
                exp.id === id ? {...exp, [field]: value} : exp
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
                edu.id === id ? {...edu, [field]: value} : edu
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
                project.id === id ? {...project, [field]: value} : project
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

    // Per-bullet expansion (used by Work Experience + Projects "Expand with AI" buttons)
    const [expandingId, setExpandingId] = useState<string | null>(null);
    const expandBulletAI = async (currentText: string): Promise<string | null> => {
        if (!requireAuth()) return null;
        const phrase = (currentText || "").trim();
        if (!phrase) {
            toast.error("Write a short phrase first (e.g. 'led migration to microservices')");
            return null;
        }
        try {
            const result = await api.post<{
                bullet?: string
            }>("/ai/expand-bullet", {phrase});
            let bullet = (result?.bullet || "").trim();
            // The AI sometimes prefixes with a bullet character; strip it for clean textarea insertion.
            bullet = bullet.replace(/^[\s••\-\*]+/, "").trim();
            if (!bullet) {
                toast.error("AI returned an empty bullet. Try a longer phrase.");
                return null;
            }
            return bullet;
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : "Bullet expansion failed");
            return null;
        }
    };

    const handleExpandExperience = async (id: string, current: string) => {
        setExpandingId(`exp-${id}`);
        const toastId = toast.loading("Expanding into a STAR-method bullet…");
        try {
            const bullet = await expandBulletAI(current);
            if (bullet) {
                updateWorkExperience(id, "description", bullet);
                toast.success("Expanded ✨", {id: toastId});
            } else {
                toast.dismiss(toastId);
            }
        } finally {
            setExpandingId(null);
        }
    };

    const handleExpandProject = async (id: string, current: string) => {
        setExpandingId(`proj-${id}`);
        const toastId = toast.loading("Expanding into a STAR-method bullet…");
        try {
            const bullet = await expandBulletAI(current);
            if (bullet) {
                updateProject(id, "description", bullet);
                toast.success("Expanded ✨", {id: toastId});
            } else {
                toast.dismiss(toastId);
            }
        } finally {
            setExpandingId(null);
        }
    };

    const handleAiEnhance = async () => {
        if (aiEnhancing) return;
        if (!requireAuth()) return;
        let workingId = resumeId;
        setAiEnhancing(true);
        const toastId = toast.loading("AI is polishing your resume…");
        try {
            // Make sure the current form state is saved first so the pipeline has the latest content.
            const saved = await save({
                resume_id: workingId,
                raw_content: buildRawContent(),
                target_job_title: personalInfo.title,
                template_id: templateId,
            });
            if (!saved) {
                toast.error("Couldn't save before AI Enhance — try again.", {id: toastId});
                return;
            }
            workingId = saved.resume_id;
            setResumeId(workingId);

            const result = await api.post<{
                polished_content?: Record<string, unknown>;
                stages?: Array<{ agent: string; output_preview: string }>;
            }>("/ai/agents/run-pipeline", {
                resume_id: workingId,
                template_id: templateId,
                tier: "free",
            });

            const polished = result.polished_content || {};
            // Re-hydrate the form from polished_content where available.
            const pName = String((polished as {
                full_name?: unknown
            }).full_name ?? personalInfo.fullName);
            const pTitle = String((polished as {
                target_job_title?: unknown
            }).target_job_title ?? personalInfo.title);
            const pAbout = String((polished as {
                about?: unknown;
                summary?: unknown
            }).about ?? (polished as {
                summary?: unknown
            }).summary ?? personalInfo.summary);
            setPersonalInfo((p) => ({
                ...p,
                fullName: pName,
                title: pTitle,
                summary: pAbout
            }));

            const expsAny = (polished as {
                experiences?: unknown
            }).experiences;
            if (Array.isArray(expsAny) && expsAny.length > 0) {
                setWorkExperience(
                    expsAny.map((e: Record<string, unknown>, i: number) => ({
                        id: String(e.id ?? Date.now() + i),
                        title: String(e.job_title ?? e.role ?? e.title ?? workExperience[i]?.title ?? ""),
                        company: String(e.company ?? e.company_name ?? workExperience[i]?.company ?? ""),
                        location: String(e.location ?? workExperience[i]?.location ?? ""),
                        startDate: String(e.start_date ?? e.startDate ?? workExperience[i]?.startDate ?? ""),
                        endDate: String(e.end_date ?? e.endDate ?? workExperience[i]?.endDate ?? ""),
                        description: String(e.description ?? workExperience[i]?.description ?? ""),
                    })),
                );
            }
            const skillsAny = (polished as { skills?: unknown }).skills;
            if (Array.isArray(skillsAny)) {
                const fresh = skillsAny.map((s: unknown) => {
                    if (typeof s === "string") return s;
                    if (s && typeof s === "object" && "skill_name" in (s as Record<string, unknown>)) {
                        return String((s as Record<string, unknown>).skill_name);
                    }
                    return "";
                }).filter(Boolean);
                if (fresh.length > 0) setSkills(fresh);
            }

            // Hide the implementation flow (4-stage pipeline) — users only care about the outcome.
            void result;
            toast.success("Resume polished ✨", {id: toastId});
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : "AI Enhance failed";
            toast.error(msg, {id: toastId});
        } finally {
            setAiEnhancing(false);
        }
    };

    // Hydrate form state when a resume is loaded from the backend
    useEffect(() => {
        if (!loadedResume) return;
        const raw = (loadedResume.raw_content || {}) as Record<string, unknown>;
        const pi = (raw as {
            personal_info?: Record<string, unknown>
        }).personal_info || {};
        setPersonalInfo({
            fullName: String(raw.full_name ?? (pi as Record<string, unknown>).fullName ?? ""),
            email: String(raw.email ?? (pi as Record<string, unknown>).email ?? ""),
            phone: String(raw.phone ?? (pi as Record<string, unknown>).phone ?? ""),
            location: String(raw.address ?? (pi as Record<string, unknown>).location ?? ""),
            title: String(raw.target_job_title ?? loadedResume.target_job_title ?? (pi as Record<string, unknown>).title ?? ""),
            summary: String(raw.about ?? (pi as Record<string, unknown>).summary ?? ""),
        });
        const photo = raw.photo_url;
        if (typeof photo === "string" && photo) setCvPhoto(photo);

        const exps = Array.isArray(raw.experiences) ? (raw.experiences as Array<Record<string, unknown>>) : [];
        if (exps.length > 0) {
            setWorkExperience(
                exps.map((e, i) => ({
                    id: String(e.id ?? Date.now() + i),
                    title: String(e.job_title ?? e.role ?? e.title ?? ""),
                    company: String(e.company ?? e.company_name ?? ""),
                    location: String(e.location ?? ""),
                    startDate: String(e.start_date ?? e.startDate ?? ""),
                    endDate: String(e.end_date ?? e.endDate ?? ""),
                    description: String(e.description ?? ""),
                })),
            );
        }
        const edus = Array.isArray(raw.education) ? (raw.education as Array<Record<string, unknown>>) : [];
        if (edus.length > 0) {
            setEducation(
                edus.map((e, i) => ({
                    id: String(e.id ?? Date.now() + i),
                    degree: String(e.degree ?? ""),
                    school: String(e.university ?? e.school ?? ""),
                    year: String(e.end_year ?? e.year ?? ""),
                })),
            );
        }
        const sk = Array.isArray(raw.skills) ? (raw.skills as Array<unknown>) : [];
        if (sk.length > 0) {
            setSkills(
                sk.map((s) => {
                    if (typeof s === "string") return s;
                    if (s && typeof s === "object" && "skill_name" in (s as Record<string, unknown>)) {
                        return String((s as Record<string, unknown>).skill_name);
                    }
                    return "";
                }).filter(Boolean),
            );
        }
        const projs = Array.isArray(raw.projects) ? (raw.projects as Array<Record<string, unknown>>) : [];
        if (projs.length > 0) {
            setProjects(
                projs.map((p, i) => ({
                    id: String(p.id ?? Date.now() + i),
                    name: String(p.name ?? p.project_name ?? ""),
                    startDate: String(p.start_date ?? p.startDate ?? ""),
                    endDate: String(p.end_date ?? p.endDate ?? ""),
                    description: String(p.description ?? ""),
                })),
            );
        }
    }, [loadedResume]);

    const buildRawContent = () => ({
        full_name: personalInfo.fullName,
        target_job_title: personalInfo.title,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address: personalInfo.location,
        about: personalInfo.summary,
        photo_url: cvPhoto ?? "",
        skills: skills.map((s) => ({skill_name: s, proficiency: 80})),
        experiences: workExperience.map((e) => ({
            id: e.id,
            job_title: e.title,
            company: e.company,
            location: e.location,
            start_date: e.startDate,
            end_date: e.endDate,
            description: e.description,
            bullets: [] as string[],
        })),
        education: education.map((e) => ({
            id: e.id,
            degree: e.degree,
            university: e.school,
            end_year: e.year,
        })),
        projects: projects.map((p) => ({
            id: p.id,
            name: p.name,
            start_date: p.startDate,
            end_date: p.endDate,
            description: p.description,
        })),
        certifications: [] as unknown[],
        languages: [] as unknown[],
        _design: {
            accent_color: accentColor,
            font_family: fontFamily,
            layout,
            section_order: sectionOrder,
            custom_sections: customSections,
        },
    });

    const [downloading, setDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (downloading) return;
        if (!requireAuth()) return;
        let workingId = resumeId;
        setDownloading(true);
        const toastId = toast.loading("Saving + rendering PDF…");
        try {
            // Always save the current form state first so the PDF reflects what's on screen.
            const saved = await save({
                resume_id: workingId,
                raw_content: buildRawContent(),
                target_job_title: personalInfo.title,
                template_id: templateId,
            });
            if (!saved) {
                toast.error("Couldn't save before downloading — try again.", {id: toastId});
                return;
            }
            workingId = saved.resume_id;
            setResumeId(workingId);

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8091";
            const token = window.localStorage.getItem("access_token");
            const res = await fetch(`${baseUrl}/resume/my-resumes/${workingId}/download`, {
                headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            });
            if (!res.ok) {
                const body = await res.text().catch(() => "");
                throw new Error(body || `Download failed (${res.status})`);
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${personalInfo.fullName || "resume"}.pdf`.replace(/\s+/g, "_");
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("PDF downloaded", {id: toastId});
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Download failed", {id: toastId});
        } finally {
            setDownloading(false);
        }
    };

    const handleSave = async () => {
        if (saving) return;
        if (!requireAuth()) return;
        setSaving(true);
        try {
            const result = await save({
                resume_id: resumeId,
                raw_content: buildRawContent(),
                target_job_title: personalInfo.title,
                template_id: templateId,
            });
            if (!result) {
                toast.error("Failed to save resume. Please try again.");
                return;
            }
            if (!resumeId) setResumeId(result.resume_id);
            toast.success("Resume saved");
        } finally {
            setSaving(false);
        }
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
        const isCollapsed = collapsedSections.has(id);

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
                <div
                    className={`flex items-center justify-between px-4 py-3 bg-gray-50 transition-colors ${isCollapsed ? "rounded-xl" : "border-b border-gray-100 rounded-t-xl"}`}>
                    <div className="flex items-center gap-2">
                        <div
                            draggable
                            onDragStart={() => handleDragStart(id)}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#088395] transition-colors"
                            title="Drag to reorder"
                        >
                            <GripVertical size={16}/>
                        </div>

                        <button
                            type="button"
                            onClick={() => toggleSectionCollapse(id)}
                            className="flex items-center gap-1.5 group"
                            title={isCollapsed ? "Expand section" : "Collapse section"}
                        >
                            <h3 className="font-semibold text-sm group-hover:text-[#088395] transition-colors">{sectionLabel(id)}</h3>
                            {isCollapsed
                                ? <ChevronDown size={14} className="text-gray-400 group-hover:text-[#088395] transition-colors"/>
                                : <ChevronUp size={14} className="text-gray-400 group-hover:text-[#088395] transition-colors"/>
                            }
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => moveSection(id, -1)}
                            disabled={idx === 0}
                            title="Move section up"
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronUp size={14}/>
                        </button>

                        <button
                            type="button"
                            onClick={() => moveSection(id, 1)}
                            disabled={idx === sectionOrder.length - 1}
                            title="Move section down"
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronDown size={14}/>
                        </button>

                        {!isCollapsed && addButton}
                    </div>
                </div>

                {!isCollapsed && <div className="p-4">{children}</div>}
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
                        <Plus size={14}/> Add
                    </button>
                ),
                children: (
                    <>
                        {workExperience.map((exp, expIdx) => (
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

                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => moveWorkExperience(exp.id, -1)}
                                            disabled={expIdx === 0}
                                            title="Move up"
                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronUp size={13}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveWorkExperience(exp.id, 1)}
                                            disabled={expIdx === workExperience.length - 1}
                                            title="Move down"
                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronDown size={13}/>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeWorkExperience(exp.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={14}/>
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

                                <div className="space-y-2">
                                    <div
                                        className="flex items-center justify-between">
                                        <span
                                            className="text-xs font-medium text-gray-600">Description</span>
                                        <button
                                            type="button"
                                            onClick={() => handleExpandExperience(exp.id, exp.description)}
                                            disabled={expandingId === `exp-${exp.id}`}
                                            title="Type a short phrase, click to expand into a professional bullet"
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#088395] bg-[#088395]/10 rounded-md hover:bg-[#088395]/20 disabled:opacity-60 disabled:cursor-wait transition-colors"
                                        >
                                            <Sparkles size={12}
                                                      className={expandingId === `exp-${exp.id}` ? "animate-spin" : ""}/>
                                            {expandingId === `exp-${exp.id}` ? "Expanding…" : "Expand with AI"}
                                        </button>
                                    </div>
                                    <textarea
                                        placeholder="Type a short phrase (e.g. 'led team migration') and click Expand with AI"
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
                        <Plus size={14}/> Add
                    </button>
                ),
                children: (
                    <>
                        {education.map((edu, eduIdx) => (
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

                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => moveEducation(edu.id, -1)}
                                            disabled={eduIdx === 0}
                                            title="Move up"
                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronUp size={13}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveEducation(edu.id, 1)}
                                            disabled={eduIdx === education.length - 1}
                                            title="Move down"
                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronDown size={13}/>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeEducation(edu.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={14}/>
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
                                        <Trash2 size={11}/>
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
                        <Plus size={14}/> Add
                    </button>
                ),
                children:
                    projects.length === 0 ? (
                        <p className="text-gray-400 text-sm">No projects
                            added yet</p>
                    ) : (
                        <>
                            {projects.map((project, projIdx) => (
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

                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => moveProject(project.id, -1)}
                                                disabled={projIdx === 0}
                                                title="Move up"
                                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronUp size={13}/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveProject(project.id, 1)}
                                                disabled={projIdx === projects.length - 1}
                                                title="Move down"
                                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronDown size={13}/>
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeProject(project.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>

                                    <div
                                        className="grid grid-cols-2 gap-3">
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

                                    <div className="space-y-2">
                                        <div
                                            className="flex items-center justify-between">
                                            <span
                                                className="text-xs font-medium text-gray-600">Project Description</span>
                                            <button
                                                type="button"
                                                onClick={() => handleExpandProject(project.id, project.description)}
                                                disabled={expandingId === `proj-${project.id}`}
                                                title="Type a short phrase, click to expand into a professional bullet"
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#088395] bg-[#088395]/10 rounded-md hover:bg-[#088395]/20 disabled:opacity-60 disabled:cursor-wait transition-colors"
                                            >
                                                <Sparkles size={12}
                                                          className={expandingId === `proj-${project.id}` ? "animate-spin" : ""}/>
                                                {expandingId === `proj-${project.id}` ? "Expanding…" : "Expand with AI"}
                                            </button>
                                        </div>
                                        <textarea
                                            placeholder="Type a short phrase (e.g. 'real-time chat app') and click Expand with AI"
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
                    <Trash2 size={14}/>
                </button>
            ),
            children: (
                <>
                    {section.items.map((item, index) => (
                        <div key={`${section.id}-${index}`}
                             className="flex gap-2 mb-2">
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
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => addCustomItem(id)}
                        className="text-sm text-[#088395] hover:text-teal-700 flex items-center gap-1 mt-1"
                    >
                        <Plus
                            size={13}/> Add {section.title.toLowerCase()} item
                    </button>
                </>
            ),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div
                className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        className="flex items-center justify-between h-16">
                        <h1 className="text-lg font-semibold text-[#088395]"/>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleAiEnhance}
                                disabled={aiEnhancing}
                                title={showLoginGate ? "Sign in to use AI Enhance" : "Run the AI pipeline to polish your resume"}
                                className={`flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all ${
                                    aiEnhancing ? "opacity-75" : ""
                                }`}
                            >
                                {showLoginGate ? (
                                    <Lock size={14}/>
                                ) : (
                                    <Sparkles size={16}
                                              className={aiEnhancing ? "animate-spin" : ""}/>
                                )}
                                {aiEnhancing ? "Enhancing..." : showLoginGate ? "Sign in to AI Enhance" : "AI Enhance"}
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || loadingResume}
                                title={showLoginGate ? "Sign in to save your resume" : "Save your resume"}
                                className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${
                                    saving || loadingResume ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                {showLoginGate ? (
                                    <Lock size={14}/>
                                ) : (
                                    <Save size={16}
                                          className={saving ? "animate-pulse" : ""}/>
                                )}
                                {saving ? "Saving..." : loadingResume ? "Loading..." : showLoginGate ? "Sign in to Save" : "Save"}
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                                title={showLoginGate ? "You need an account to download the PDF" : "Download your resume as a PDF"}
                                className={`flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all ${
                                    downloading ? "opacity-75 cursor-wait" : ""
                                }`}
                            >
                                {showLoginGate ? (
                                    <Lock size={14}/>
                                ) : (
                                    <Download size={16}
                                              className={downloading ? "animate-pulse" : ""}/>
                                )}
                                {downloading ? "Downloading…" : showLoginGate ? "Sign in to Download" : "Download PDF"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showLoginGate && (
                <div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <div
                        className="flex items-center gap-3 p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900">
                        <Lock size={18} className="flex-shrink-0"/>
                        <div className="flex-1 text-sm">
                            <strong>You&apos;re not signed in.</strong> You
                            can build and preview your resume here, but
                            you&apos;ll need a free account
                            to <strong>Save</strong>, <strong>AI
                            Enhance</strong>, or <strong>Download
                            PDF</strong>.
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={openLogin}
                                className="px-3 py-1.5 text-sm rounded-md border-2 border-yellow-700/30 text-yellow-900 hover:bg-yellow-100 transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={openSignup}
                                className="px-3 py-1.5 text-sm rounded-md bg-[#088395] text-white hover:shadow-lg transition-all"
                            >
                                Sign Up Free
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                                        <div
                                            className="bg-white rounded-xl border-2 border-gray-200">
                                            <div
                                                className={`flex items-center justify-between px-4 py-3 bg-gray-50 transition-colors ${collapsedSections.has("personal") ? "rounded-xl" : "border-b border-gray-100 rounded-t-xl"}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSectionCollapse("personal")}
                                                    className="flex items-center gap-1.5 group"
                                                    title={collapsedSections.has("personal") ? "Expand section" : "Collapse section"}
                                                >
                                                    <h3 className="font-semibold text-sm group-hover:text-[#088395] transition-colors">
                                                        Personal Information
                                                    </h3>
                                                    {collapsedSections.has("personal")
                                                        ? <ChevronDown size={14} className="text-gray-400 group-hover:text-[#088395] transition-colors"/>
                                                        : <ChevronUp size={14} className="text-gray-400 group-hover:text-[#088395] transition-colors"/>
                                                    }
                                                </button>

                                                <span className="text-xs text-gray-400 italic">
                                                    (always first)
                                                </span>
                                            </div>

                                            {!collapsedSections.has("personal") && (
                                            <div className="p-4 space-y-3">
                                                <div
                                                    className="flex justify-center mb-2">
                                                    <div
                                                        className="relative">
                                                        <div
                                                            className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                                                            {cvPhoto ? (
                                                                <img
                                                                    src={cvPhoto}
                                                                    alt="CV"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <User
                                                                    size={28}
                                                                    className="text-gray-400"/>
                                                            )}
                                                        </div>

                                                        <label
                                                            className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#088395] rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors">
                                                            <Upload
                                                                size={13}
                                                                className="text-white"/>

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
                                                ].map(({
                                                           key,
                                                           placeholder,
                                                           type
                                                       }) => (
                                                    <input
                                                        key={key}
                                                        type={type}
                                                        placeholder={placeholder}
                                                        value={
                                                            (personalInfo as Record<string, string>)[key]
                                                        }
                                                        onChange={(e) => {
                                                            let val = e.target.value;
                                                            if (key === "phone") {
                                                                val = val.replace(/[^\d+\-\s().]/g, "");
                                                            }
                                                            setPersonalInfo({
                                                                ...personalInfo,
                                                                [key]: val,
                                                            });
                                                        }}
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
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 flex items-center gap-1 px-1">
                                            <GripVertical size={12}/>
                                            Drag the grip handle or use ↑ ↓
                                            to reorder sections
                                        </p>

                                        {sectionOrder.map((id) => renderEditorSection(id))}

                                        <div
                                            className="bg-white rounded-xl border-2 border-gray-200 p-4">
                                            <h3 className="font-semibold text-sm mb-3">
                                                Add Category
                                            </h3>

                                            <div
                                                className="flex flex-wrap gap-2">
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
                                        <div>
                                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                                <Palette size={20}/> Color
                                                Theme
                                            </h3>

                                            <div
                                                className="flex flex-wrap gap-3">
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
                                                        style={{backgroundColor: color}}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                                <Type size={20}/> Font
                                                Family
                                            </h3>

                                            <select
                                                value={fontFamily}
                                                onChange={(e) => setFontFamily(e.target.value)}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none"
                                                style={{borderColor: accentColor}}
                                            >
                                                {FONTS.map((font) => (
                                                    <option
                                                        key={font}>{font}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-4">Layout</h3>

                                            <div
                                                className="grid grid-cols-2 gap-4">
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
                                                                ? {borderColor: accentColor}
                                                                : {}
                                                        }
                                                    >
                                                        <div
                                                            className="aspect-[8.5/11] bg-white rounded shadow-sm"/>

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
                        <div
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <div
                                className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Eye size={20}/> Live Preview
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {dbTemplate?.name ?? "Template"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="text-sm text-[#088395] hover:text-teal-700"
                                >
                                    Full Screen
                                </button>
                            </div>

                            <div
                                className="aspect-[8.5/11] bg-white shadow-2xl rounded-lg p-6 overflow-auto border border-gray-200">
                                <ResumePreview
                                    templateId={previewTemplateId}
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

                {/* Pro-only Resume Strength panel at the bottom (8-dimension skill matrix).
            Hidden for free users, shows an upgrade nudge instead. */}
                <ResumeStrengthPanel resumeId={resumeId}/>
            </div>
        </div>
    );
}