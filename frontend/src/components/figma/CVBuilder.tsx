"use client";

import {useEffect, useRef, useState} from "react";
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    GripVertical,
    Lock,
    Maximize2,
    Minimize2,
    Palette,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Type,
    Upload,
    User,
} from "lucide-react";
import Link from "next/link";
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
interface OnlineLink {
    id: string;
    platform: string;
    url: string;
}
interface WorkExperience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
}

interface Education {
    id: string;
    degree: string;
    school: string;
    startDate: string;
    year: string;
}

interface Project {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    link: string;
}

interface Skill {
    id: string;
    name: string;
    proficiency: string;
    items: string;
    rating: number;
}

const SKILL_PROFICIENCY = ["Beginner", "Intermediate", "Advanced", "Expert"];
function proficiencyToRating(proficiency: string) {
    if (proficiency === "Expert") return 5;
    if (proficiency === "Advanced") return 4;
    if (proficiency === "Intermediate") return 3;
    if (proficiency === "Beginner") return 2;
    return 4;
}

interface Language {
    id: string;
    language_name: string;
    proficiency: string;
}

interface Certification {
    id: string;
    certification_name: string;
    date_obtained: string;
    issuer: string;
}

interface CustomSection {
    id: string;
    title: string;
    items: string[];
}
type BuiltInSectionId =
    | "onlinePresence"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "languages"
    | "certifications";
type SectionId = BuiltInSectionId | string;

const BUILT_IN_ORDER: SectionId[] = [
    "onlinePresence",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "languages",
];

const normalizeSectionOrder = (
    savedOrder: SectionId[],
    customSectionsList: CustomSection[] = []
): SectionId[] => {
    const customIds = customSectionsList.map((section) => section.id);

    const allowed = new Set<SectionId>([
        ...BUILT_IN_ORDER,
        "certifications",
        ...customIds,
    ]);

    const cleanedSavedOrder = savedOrder.filter(
        (id) => allowed.has(id) && id !== "personal"
    );

    const missingBuiltIns = BUILT_IN_ORDER.filter(
        (id) => !cleanedSavedOrder.includes(id)
    );

    const missingCustomIds = customIds.filter(
        (id) => !cleanedSavedOrder.includes(id)
    );

    return [
        ...cleanedSavedOrder,
        ...missingBuiltIns,
        ...missingCustomIds,
    ];
};

function reorder<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
    if (fromIdx < 0 || fromIdx >= arr.length) return arr;
    if (toIdx < 0 || toIdx >= arr.length) return arr;
    if (fromIdx === toIdx) return arr;

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
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
    const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);
    const previewCardRef = useRef<HTMLDivElement>(null);
    const resizeDragRef = useRef<{
        startX: number; startY: number;
        startW: number; startH: number;
        corner: string;
    } | null>(null);
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

const templateCheck = `${previewTemplateId} ${templateId} ${dbTemplate?.name ?? ""}`.toLowerCase();

const isTemplate4 =
    templateCheck.includes("template4") ||
    templateCheck.includes("template 4") ||
    templateCheck.includes("executive") ||
    templateCheck.includes("elite");
const isTemplate5 =
    templateCheck.includes("template5") ||
    templateCheck.includes("template 5") ||
    templateCheck.includes("tech") ||
    templateCheck.includes("innovator");
    const isTemplate6 =
    templateCheck.includes("template6") ||
    templateCheck.includes("template 6") ||
    templateCheck.includes("designer") ||
    templateCheck.includes("portfolio");
    const isTemplate7 =
    templateCheck.includes("template7") ||
    templateCheck.includes("template 7") ||
    templateCheck.includes("academic") ||
    templateCheck.includes("scholar") ||
    templateCheck.includes("mint") ||
    templateCheck.includes("card");
    const isTemplate8 =
    templateCheck.includes("template8") ||
    templateCheck.includes("template 8") ||
    templateCheck.includes("startup") ||
    templateCheck.includes("founder");
    const isTemplate10 =
    templateCheck.includes("template10") ||
    templateCheck.includes("template 10") ||
    templateCheck.includes("pink") ||
    templateCheck.includes("hr") ||
    templateCheck.includes("business");
    const isTemplate11 =
    templateCheck.includes("template11") ||
    templateCheck.includes("template 11") ||
    templateCheck.includes("purple") ||
    templateCheck.includes("talent") ||
    templateCheck.includes("development");
    const isTemplate12 =
    templateCheck.includes("template12") ||
    templateCheck.includes("template 12") ||
    templateCheck.includes("modern") ||
    templateCheck.includes("minimal");

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

    const saveAsGuest = async (): Promise<string | null> => {
        try {
            const result = await api.post<{ resume_id: string }>("/resume/guest-save", {
                raw_content: buildRawContent(),
                target_job_title: personalInfo.title,
                template_id: templateId,
            }, { auth: false });
            return result?.resume_id ?? null;
        } catch {
            return null;
        }
    };

    const handleAuthFromBanner = (mode: "login" | "signup") => {
        const savePromise = saveAsGuest();
        // Store in localStorage immediately once the save completes so the OAuth
        // redirect fallback (auth/callback) can claim the resume if the user picks
        // Google/LinkedIn instead of email/password.
        savePromise.then((id) => {
            if (id) {
                window.localStorage.setItem("pending_resume_id", id);
                window.localStorage.setItem("pending_template_key", templateId);
            }
        });
        const open = mode === "login" ? openLogin : openSignup;
        open({
            onComplete: async () => {
                const guestResumeId = await savePromise;
                if (guestResumeId) {
                    try {
                        await api.post(`/resume/my-resumes/${guestResumeId}/claim`);
                        setResumeId(guestResumeId);
                        window.localStorage.removeItem("pending_resume_id");
                        window.localStorage.removeItem("pending_template_key");
                        toast.success("Resume saved to your account!");
                    } catch {
                        // Claim failed silently — user is logged in, can save manually
                    }
                }
            },
        });
    };

    const requireAuth = (): boolean => {
        if (typeof window === "undefined") return false;
        const token = window.localStorage.getItem("access_token");
        if (!token) {
            toast.info("Please sign in to continue", {duration: 2500});
            handleAuthFromBanner("login");
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

    // Template 4 / Executive Elite fields
    website: "",
    github: "",

});


    const [workExperience, setWorkExperience] = useState<WorkExperience[]>([

    ]);

    const [education, setEducation] = useState<Education[]>([

    ]);

    const [skills, setSkills] = useState<Skill[]>([

    ]);

    const [newSkill, setNewSkill] = useState("");
const [newSkillProficiency, setNewSkillProficiency] = useState("Intermediate");
const [newSkillItems, setNewSkillItems] = useState("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [onlineLinks, setOnlineLinks] = useState<OnlineLink[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [customSections, setCustomSections] = useState<CustomSection[]>([]);
    const [aiEnhancing, setAiEnhancing] = useState(false);

    const [sectionOrder, setSectionOrder] =
        useState<SectionId[]>(BUILT_IN_ORDER);


const visibleSectionOrder = sectionOrder;

const previewData: CVData = {
    personalInfo,
    cvPhoto,
    onlineLinks,
    workExperience,
    education,

    // Keep this for the other templates
    skills: skills.map((skill) => skill.name),

    // Template 3 uses this
    technicalSkills: skills.map((skill) => ({
        name: skill.name,
        category: skill.name,
        level: skill.proficiency,
        proficiency: skill.proficiency,
        items: skill.items
            ? skill.items
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        rating: skill.rating,
    })),

    projects,
    languages,
    certifications,
    customSections,
    sectionOrder: visibleSectionOrder,
    accentColor,
    fontFamily: FONT_CSS[fontFamily] ?? fontFamily,
};

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

    setSectionOrder((prev) => {
        const fromIdx = prev.indexOf(src);
        const toIdx = prev.indexOf(targetId);

        return reorder(prev, fromIdx, toIdx);
    });

    dragId.current = null;
    setDragOverId(null);
};

    const handleDragEnd = () => {
        dragId.current = null;
        setDragOverId(null);
    };

    const moveSection = (id: SectionId, direction: -1 | 1) => {
    const visibleIdx = visibleSectionOrder.indexOf(id);
    const targetId = visibleSectionOrder[visibleIdx + direction];

    if (!targetId) return;

    setSectionOrder((prev) => {
        const fromIdx = prev.indexOf(id);
        const toIdx = prev.indexOf(targetId);

        return reorder(prev, fromIdx, toIdx);
    });
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
                isCurrent: false,
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
                startDate: "",
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

    setSkills([
        ...skills,
        {
            id: Date.now().toString(),
            name: newSkill.trim(),
            proficiency: newSkillProficiency,
            items: newSkillItems.trim(),
            rating: proficiencyToRating(newSkillProficiency),
        },
    ]);

    setNewSkill("");
    setNewSkillProficiency("Intermediate");
    setNewSkillItems("");
};

    const removeSkill = (id: string) => {
        setSkills(skills.filter((s) => s.id !== id));
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
                link: "",
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
    setCustomSections((prev) =>
        prev.filter((section) => section.id !== id)
    );

    setSectionOrder((prev) =>
        prev.filter((sectionId) => sectionId !== id)
    );
};

    const addLanguage = () => {
        setLanguages([...languages, { id: Date.now().toString(), language_name: "", proficiency: "Conversational" }]);
    };
    const updateLanguage = (id: string, field: keyof Language, value: string) => {
        setLanguages(languages.map((l) => l.id === id ? { ...l, [field]: value } : l));
    };
    const removeLanguage = (id: string) => {
        setLanguages(languages.filter((l) => l.id !== id));
    };

    const addCertification = () => {
        setCertifications([...certifications, { id: Date.now().toString(), certification_name: "", date_obtained: "", issuer: "" }]);
    };
    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setCertifications(certifications.map((c) => c.id === id ? { ...c, [field]: value } : c));
    };
    const removeCertification = (id: string) => {
        setCertifications(certifications.filter((c) => c.id !== id));
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

    const handleExpandSummary = async () => {
        setExpandingId("summary");
        const toastId = toast.loading("Expanding summary…");
        try {
            const result = await expandBulletAI(personalInfo.summary);
            if (result) {
                setPersonalInfo((p) => ({ ...p, summary: result }));
                toast.success("Expanded ✨", { id: toastId });
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
                        title: String(e.role ?? e.job_title ?? e.title ?? workExperience[i]?.title ?? ""),
                        company: String(e.company_name ?? e.company ?? workExperience[i]?.company ?? ""),
                        location: String(e.location ?? workExperience[i]?.location ?? ""),
                        startDate: String(e.start_date ?? e.startDate ?? workExperience[i]?.startDate ?? ""),
                        endDate: String(e.end_date ?? e.endDate ?? workExperience[i]?.endDate ?? ""),
                        isCurrent: Boolean(e.is_current ?? workExperience[i]?.isCurrent ?? false),
                        description: String(e.description ?? workExperience[i]?.description ?? ""),
                    })),
                );
            }
            const skillsAny = (polished as { skills?: unknown }).skills;

if (Array.isArray(skillsAny)) {
    const fresh: Skill[] = skillsAny.map((s: unknown, i: number) => {
        if (typeof s === "string") {
            return {
                id: String(i),
                name: s,
                proficiency: "Intermediate",
                items: "",
                rating: proficiencyToRating("Intermediate"),
            };
        }

        const obj = s as Record<string, unknown>;
        const proficiency = String(obj.proficiency ?? "Intermediate");

        return {
            id: String(obj.skill_id ?? i),
            name: String(obj.skill_name ?? obj.name ?? ""),
            proficiency,
            items: Array.isArray(obj.items)
                ? obj.items.join(", ")
                : String(obj.items ?? ""),
            rating:
                typeof obj.rating === "number"
                    ? obj.rating
                    : proficiencyToRating(proficiency),
        };
    }).filter((s) => s.name);

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

    website: String(raw.website ?? (pi as Record<string, unknown>).website ?? ""),
    github: String(raw.github ?? (pi as Record<string, unknown>).github ?? ""),
});

const loadedLinksRaw =
    Array.isArray(raw.links)
        ? (raw.links as Array<Record<string, unknown>>)
        : Array.isArray(raw.profiles)
            ? (raw.profiles as Array<Record<string, unknown>>)
            : [];

if (loadedLinksRaw.length > 0) {
    setOnlineLinks(
        loadedLinksRaw.map((link, i) => ({
            id: String(link.id ?? Date.now() + i),
            platform: String(link.platform ?? link.label ?? link.name ?? ""),
            url: String(link.url ?? link.link ?? ""),
        }))
    );
}

        const photo = raw.photo_url;
        if (typeof photo === "string" && photo) setCvPhoto(photo);

        const exps = Array.isArray(raw.experiences) ? (raw.experiences as Array<Record<string, unknown>>) : [];
        if (exps.length > 0) {
            setWorkExperience(
                exps.map((e, i) => ({
                    id: String(e.id ?? Date.now() + i),
                    title: String(e.role ?? e.job_title ?? e.title ?? ""),
                    company: String(e.company_name ?? e.company ?? ""),
                    location: String(e.location ?? ""),
                    startDate: String(e.start_date ?? e.startDate ?? ""),
                    endDate: String(e.end_date ?? e.endDate ?? ""),
                    isCurrent: Boolean(e.is_current ?? false),
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
                    startDate: String(e.start_date ?? e.startDate ?? ""),
                    year: String(e.end_date ?? e.end_year ?? e.year ?? ""),
                })),
            );
        }
        const sk = Array.isArray(raw.skills) ? (raw.skills as Array<unknown>) : [];

if (sk.length > 0) {
    const loaded: Skill[] = sk.map((s, i) => {
        if (typeof s === "string") {
            return {
                id: String(i),
                name: s,
                proficiency: "Intermediate",
                items: "",
                rating: proficiencyToRating("Intermediate"),
            };
        }

        const obj = s as Record<string, unknown>;
        const proficiency = String(obj.proficiency ?? "Intermediate");

        return {
            id: String(obj.skill_id ?? i),
            name: String(obj.skill_name ?? obj.name ?? ""),
            proficiency,
            items: Array.isArray(obj.items)
                ? obj.items.join(", ")
                : String(obj.items ?? ""),
            rating:
                typeof obj.rating === "number"
                    ? obj.rating
                    : proficiencyToRating(proficiency),
        };
    }).filter((s) => s.name);

    if (loaded.length > 0) setSkills(loaded);
}
        const projs = Array.isArray(raw.projects) ? (raw.projects as Array<Record<string, unknown>>) : [];
        if (projs.length > 0) {
            setProjects(
                projs.map((p, i) => ({
                    id: String(p.id ?? Date.now() + i),
                    name: String(p.project_name ?? p.name ?? ""),
                    startDate: String(p.start_date ?? p.startDate ?? ""),
                    endDate: String(p.end_date ?? p.endDate ?? ""),
                    description: String(p.description ?? ""),
                    link: String(p.link ?? ""),
                })),
            );
        }
        const langs = Array.isArray(raw.languages) ? (raw.languages as Array<Record<string, unknown>>) : [];
        if (langs.length > 0) {
            setLanguages(langs.map((l, i) => ({
                id: String(l.language_id ?? Date.now() + i),
                language_name: String(l.language_name ?? ""),
                proficiency: String(l.proficiency ?? "Conversational"),
            })));
        }
        const certs = Array.isArray(raw.certifications) ? (raw.certifications as Array<Record<string, unknown>>) : [];
        if (certs.length > 0) {
            setCertifications(certs.map((c, i) => ({
                id: String(c.certification_id ?? Date.now() + i),
                certification_name: String(c.certification_name ?? ""),
                date_obtained: String(c.date_obtained ?? ""),
                issuer: String(c.company_name ?? c.issuer ?? ""),
            })));
            // ensure the certifications section is visible when loading a resume that has them
            setSectionOrder((prev) => prev.includes("certifications") ? prev : [...prev, "certifications"]);
        }

        const design = (raw._design as Record<string, unknown>) ?? {};
const savedOrder = design.section_order;

if (Array.isArray(savedOrder) && savedOrder.length > 0) {
    setSectionOrder(
        normalizeSectionOrder(savedOrder as SectionId[], customSections)
    );
} else {
    setSectionOrder(normalizeSectionOrder(BUILT_IN_ORDER, customSections));
}
    }, [loadedResume]);

    const buildRawContent = () => ({
    full_name: personalInfo.fullName,
    target_job_title: personalInfo.title,
    email: personalInfo.email,
    phone: personalInfo.phone,
    address: personalInfo.location,

    website: personalInfo.website,
    github: personalInfo.github,

        links: onlineLinks.map((link) => ({
  id: link.id,
  platform: link.platform,
  url: link.url,
})),


    about: personalInfo.summary,
    photo_url: cvPhoto ?? "",
        skills: skills.map((s) => ({ skill_id: s.id, skill_name: s.name, proficiency: s.proficiency })),
        experiences: workExperience.map((e) => ({
            id: e.id,
            role: e.title,
            company_name: e.company,
            location: e.location,
            start_date: e.startDate,
            end_date: e.endDate,
            is_current: e.isCurrent,
            description: e.description,
        })),
        education: education.map((e) => ({
            id: e.id,
            degree: e.degree,
            university: e.school,
            start_date: e.startDate,
            end_date: e.year,
        })),
        projects: projects.map((p) => ({
            id: p.id,
            project_name: p.name,
            start_date: p.startDate,
            end_date: p.endDate,
            description: p.description,
            link: p.link,
        })),
        languages: languages.map((l) => ({
            language_id: l.id,
            language_name: l.language_name,
            proficiency: l.proficiency,
        })),
        certifications: certifications.map((c) => ({
            certification_id: c.id,
            certification_name: c.certification_name,
            date_obtained: c.date_obtained,
            company_name: c.issuer,
        })),
        _design: {
            accent_color: accentColor,
            font_family: fontFamily,
            layout,
            section_order: visibleSectionOrder,
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
        if (id === "onlinePresence") {
    return isTemplate6 ? "Profiles" : "Online Presence";
}
        if (id === "summary") return "Professional Summary";
        if (id === "experience") return "Work Experience";
        if (id === "education") return "Education";
        if (id === "skills") return "Skills";
        if (id === "projects") return "Projects";
        if (id === "languages") return "Languages";
        if (id === "certifications") return "Certifications";

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
        const idx = visibleSectionOrder.indexOf(id);
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
                            disabled={idx === visibleSectionOrder.length - 1}
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

        if (id === "summary") {
            return renderSectionWrapper({
                id,
                children: (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Summary</span>
                            <button
                                type="button"
                                onClick={handleExpandSummary}
                                disabled={expandingId === "summary"}
                                title="Type a short phrase, click to expand into a professional summary"
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#088395] bg-[#088395]/10 rounded-md hover:bg-[#088395]/20 disabled:opacity-60 disabled:cursor-wait transition-colors"
                            >
                                <Sparkles size={12} className={expandingId === "summary" ? "animate-spin" : ""} />
                                {expandingId === "summary" ? "Expanding…" : "Expand with AI"}
                            </button>
                        </div>
                        <textarea
                            placeholder="Type a short phrase (e.g. 'senior engineer with 5 years in fintech') and click Expand with AI"
                            value={personalInfo.summary}
                            rows={4}
                            onChange={(e) =>
                                setPersonalInfo({
                                    ...personalInfo,
                                    summary: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none text-sm"
                        />
                    </div>
                ),
            });
        }

        if (id === "onlinePresence") {
    const addOnlineLink = () => {
        setOnlineLinks((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                platform: "",
                url: "",
            },
        ]);
    };

    const updateOnlineLink = (
        linkId: string,
        field: keyof OnlineLink,
        value: string
    ) => {
        setOnlineLinks((prev) =>
            prev.map((link) =>
                link.id === linkId ? { ...link, [field]: value } : link
            )
        );
    };

    const removeOnlineLink = (linkId: string) => {
        setOnlineLinks((prev) => prev.filter((link) => link.id !== linkId));
    };

    return renderSectionWrapper({
        id,
        addButton: (
            <button
                type="button"
                onClick={addOnlineLink}
                className="flex items-center gap-1 text-xs text-[#088395] hover:text-teal-700 ml-1"
            >
                <Plus size={14}/> Add
            </button>
        ),
        children: onlineLinks.length === 0 ? (
            <p className="text-gray-400 text-sm">
       {isTemplate6 ? "No profiles added yet" : "No online presence links added yet"}
            </p>
        ) : (
            <>
                {onlineLinks.map((link) => (
                    <div
                        key={link.id}
                        className="space-y-3 p-4 bg-gray-50 rounded-lg mb-3 border border-gray-100"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Platform, e.g. LinkedIn, GitHub, Portfolio"
                                value={link.platform}
                                onChange={(e) =>
                                    updateOnlineLink(link.id, "platform", e.target.value)
                                }
                                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                            />

                            <button
                                type="button"
                                onClick={() => removeOnlineLink(link.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="URL, e.g. https://linkedin.com/in/yourname"
                            value={link.url}
                            onChange={(e) =>
                                updateOnlineLink(link.id, "url", e.target.value)
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                        />
                    </div>
                ))}
            </>
        ),
    });
}
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
                                        disabled={exp.isCurrent}
                                        onChange={(e) =>
                                            updateWorkExperience(exp.id, "endDate", e.target.value)
                                        }
                                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={exp.isCurrent}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setWorkExperience((prev) => prev.map((x) =>
                                                x.id === exp.id
                                                    ? { ...x, isCurrent: checked, endDate: checked ? "Present" : x.endDate }
                                                    : x
                                            ));
                                        }}
                                        className="accent-[#088395]"
                                    />
                                    Currently working here
                                </label>

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
                                    placeholder="School / University"
                                    value={edu.school}
                                    onChange={(e) =>
                                        updateEducation(edu.id, "school", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Start Date"
                                        value={edu.startDate}
                                        onChange={(e) =>
                                            updateEducation(edu.id, "startDate", e.target.value)
                                        }
                                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="End Date / Year"
                                        value={edu.year}
                                        onChange={(e) =>
                                            updateEducation(edu.id, "year", e.target.value)
                                        }
                                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                    />
                                </div>
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
                        <div className="space-y-2 mb-3">
                            {skills.map((skill) => (
    <div
        key={skill.id}
        className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
    >
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={skill.name}
                onChange={(e) =>
                    setSkills(
                        skills.map((s) =>
                            s.id === skill.id
                                ? { ...s, name: e.target.value }
                                : s
                        )
                    )
                }
                placeholder="Skill category"
                className="flex-1 px-3 py-1.5 bg-[#088395]/10 text-[#088395] rounded-lg text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#088395]/30"
            />

            <select
                value={skill.proficiency}
                onChange={(e) =>
                    setSkills(
                        skills.map((s) =>
                            s.id === skill.id
                                ? {
                                    ...s,
                                    proficiency: e.target.value,
                                    rating: proficiencyToRating(e.target.value),
                                }
                                : s
                        )
                    )
                }
                className="px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-xs text-gray-600"
            >
                {SKILL_PROFICIENCY.map((l) => (
                    <option key={l}>{l}</option>
                ))}
            </select>

            <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
                <Trash2 size={12}/>
            </button>
        </div>

        <input
            type="text"
            value={skill.items}
            onChange={(e) =>
                setSkills(
                    skills.map((s) =>
                        s.id === skill.id
                            ? { ...s, items: e.target.value }
                            : s
                    )
                )
            }
            placeholder="Items/tools, e.g. C#, Editor Tools, Profiling"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
        />
    </div>
))}
                        </div>

                        <div className="space-y-2">
    <div className="flex gap-2">
        <input
            type="text"
            placeholder="Skill category, e.g. Unity Engine"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
        />

        <select
            value={newSkillProficiency}
            onChange={(e) => setNewSkillProficiency(e.target.value)}
            className="px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
        >
            {SKILL_PROFICIENCY.map((l) => (
                <option key={l}>{l}</option>
            ))}
        </select>
    </div>

    <div className="flex gap-2">
        <input
            type="text"
            placeholder="Items/tools, e.g. C#, Editor Tools, Profiling"
            value={newSkillItems}
            onChange={(e) => setNewSkillItems(e.target.value)}
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

                                    <input
                                        type="url"
                                        placeholder="Project Link (optional)"
                                        value={project.link}
                                        onChange={(e) =>
                                            updateProject(project.id, "link", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                    />

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

        if (id === "languages") {
            const PROFICIENCY_LEVELS = ["Basic", "Conversational", "Professional", "Fluent", "Native"];
            return renderSectionWrapper({
                id,
                addButton: (
                    <button type="button" onClick={addLanguage}
                        className="flex items-center gap-1 text-xs text-[#088395] hover:text-teal-700 ml-1">
                        <Plus size={14}/> Add
                    </button>
                ),
                children: languages.length === 0 ? (
                    <p className="text-gray-400 text-sm">No languages added yet</p>
                ) : (
                    <>
                        {languages.map((lang) => (
                            <div key={lang.id} className="flex gap-2 mb-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Language"
                                    value={lang.language_name}
                                    onChange={(e) => updateLanguage(lang.id, "language_name", e.target.value)}
                                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                />
                                <select
                                    value={lang.proficiency}
                                    onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)}
                                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                >
                                    {PROFICIENCY_LEVELS.map((l) => <option key={l}>{l}</option>)}
                                </select>
                                <button type="button" onClick={() => removeLanguage(lang.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                    </>
                ),
            });
        }

        if (id === "certifications") {
            return renderSectionWrapper({
                id,
                addButton: (
                    <button type="button" onClick={addCertification}
                        className="flex items-center gap-1 text-xs text-[#088395] hover:text-teal-700 ml-1">
                        <Plus size={14}/> Add
                    </button>
                ),
                children: certifications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No certifications added yet</p>
                ) : (
                    <>
                        {certifications.map((cert) => (
                            <div key={cert.id} className="space-y-2 p-3 bg-gray-50 rounded-lg mb-2 border border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Certification Name"
                                        value={cert.certification_name}
                                        onChange={(e) => updateCertification(cert.id, "certification_name", e.target.value)}
                                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                    />
                                    <button type="button" onClick={() => removeCertification(cert.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Issuing Organization"
                                    value={cert.issuer}
                                    onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Date Obtained (e.g. 2024-06)"
                                    value={cert.date_obtained}
                                    onChange={(e) => updateCertification(cert.id, "date_obtained", e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
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

    const startPreviewResize = (e: React.MouseEvent, corner: string) => {
        e.preventDefault();
        const card = previewCardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        resizeDragRef.current = {
            startX: e.clientX, startY: e.clientY,
            startW: rect.width, startH: rect.height,
            corner,
        };
        const onMove = (ev: MouseEvent) => {
            if (!resizeDragRef.current) return;
            const {startX, startY, startW, startH, corner} = resizeDragRef.current;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            let w = startW, h = startH;
            if (corner.includes('e')) w = Math.max(320, startW + dx);
            if (corner.includes('w')) w = Math.max(320, startW - dx);
            if (corner.includes('s')) h = Math.max(280, startH + dy);
            if (corner.includes('n')) h = Math.max(280, startH - dy);
            setPreviewSize({width: w, height: h});
        };
        const onUp = () => {
            resizeDragRef.current = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div
                className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        className="flex items-center justify-between h-16">
                        <Link
                            href="/templates/all"
                            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-600"
                        >
                            <ArrowLeft size={16}/> Back to Templates
                        </Link>

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
                                onClick={() => handleAuthFromBanner("login")}
                                className="px-3 py-1.5 text-sm rounded-md border-2 border-yellow-700/30 text-yellow-900 hover:bg-yellow-100 transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => handleAuthFromBanner("signup")}
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

    ...(isTemplate4
        ? [
              {
                  key: "website",
                  placeholder: "Website / Portfolio",
                  type: "text",
              },
              {
                  key: "github",
                  placeholder: "GitHub / LinkedIn / Social",
                  type: "text",
              },
          ]
        : [
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
          ]),
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

                                            </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 flex items-center gap-1 px-1">
                                            <GripVertical size={12}/>
                                            Drag the grip handle or use ↑ ↓
                                            to reorder sections
                                        </p>

                                        {visibleSectionOrder.map((id) => renderEditorSection(id))}

                                        <div
                                            className="bg-white rounded-xl border-2 border-gray-200 p-4">
                                            <h3 className="font-semibold text-sm mb-3">
                                                Add Category
                                            </h3>

                                            <div
                                                className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => addCustomSection("Training")}
                                                    disabled={customSections.some((s) => s.title === "Training")}
                                                    className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-colors ${
                                                        customSections.some((s) => s.title === "Training")
                                                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "border-[#088395]/30 text-[#088395] hover:bg-[#088395]/5"
                                                    }`}
                                                >
                                                    Training
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!sectionOrder.includes("certifications")) {
                                                            setSectionOrder((prev) => [...prev, "certifications"]);
                                                        }
                                                        setCollapsedSections((prev) => {
                                                            const next = new Set(prev);
                                                            next.delete("certifications");
                                                            return next;
                                                        });
                                                    }}
                                                    disabled={sectionOrder.includes("certifications")}
                                                    className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-colors ${
                                                        sectionOrder.includes("certifications")
                                                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "border-[#088395]/30 text-[#088395] hover:bg-[#088395]/5"
                                                    }`}
                                                >
                                                    Certificates
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

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Live Preview panel (supports fullscreen overlay) ───── */}
                    {isPreviewFullscreen && (
                        <div
                            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setIsPreviewFullscreen(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setIsPreviewFullscreen(false);
                            }}
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                            tabIndex={0}
                            ref={(el) => el?.focus()}
                        >
                            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
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
                                        onClick={() => setIsPreviewFullscreen(false)}
                                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                        <Minimize2 size={15}/> Exit Full Screen
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                                    <div className="bg-white shadow-2xl rounded-lg p-6 mx-auto" style={{maxWidth: "850px"}}>
                                        <ResumePreview
                                            templateId={previewTemplateId}
                                            data={previewData}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="lg:sticky lg:top-32 h-fit">
                        <div
                            ref={previewCardRef}
                            className="relative bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                            style={previewSize ? {width: previewSize.width, height: previewSize.height, overflow: 'hidden'} : undefined}
                        >
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

                                <div className="flex items-center gap-3">
                                    {previewSize && (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewSize(null)}
                                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Reset size"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewFullscreen(true)}
                                        className="flex items-center gap-1.5 text-sm text-[#088395] hover:text-teal-700 transition-colors"
                                    >
                                        <Maximize2 size={15}/> Full Screen
                                    </button>
                                </div>
                            </div>

                            <div
                                className={`bg-white shadow-2xl rounded-lg p-6 border border-gray-200 ${previewSize ? 'overflow-auto' : 'aspect-[8.5/11] overflow-auto'}`}
                                style={previewSize ? {height: 'calc(100% - 64px)'} : undefined}
                            >
                                <ResumePreview
                                    templateId={previewTemplateId}
                                    data={previewData}
                                />
                            </div>

                            {/* Corner resize handles */}
                            {(['nw','ne','sw','se'] as const).map((corner) => (
                                <div
                                    key={corner}
                                    onMouseDown={(e) => startPreviewResize(e, corner)}
                                    className={`absolute w-4 h-4 z-10 ${
                                        corner === 'nw' ? 'top-0 left-0 cursor-nw-resize' :
                                        corner === 'ne' ? 'top-0 right-0 cursor-ne-resize' :
                                        corner === 'sw' ? 'bottom-0 left-0 cursor-sw-resize' :
                                        'bottom-0 right-0 cursor-se-resize'
                                    }`}
                                    style={{
                                        background: 'radial-gradient(circle at center, #088395 3px, transparent 3px)',
                                        opacity: 0.5,
                                    }}
                                />
                            ))}
                            {/* Edge resize handles */}
                            <div onMouseDown={(e) => startPreviewResize(e, 'n')} className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-10"/>
                            <div onMouseDown={(e) => startPreviewResize(e, 's')} className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-10"/>
                            <div onMouseDown={(e) => startPreviewResize(e, 'w')} className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-10"/>
                            <div onMouseDown={(e) => startPreviewResize(e, 'e')} className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-10"/>
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