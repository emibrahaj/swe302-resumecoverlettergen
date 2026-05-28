"use client";
import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
    Briefcase,
    CheckCircle,
    Crown,
    Download,
    Eye,
    FileText, FileUser,
    Lock,
    Mail,
    MessageSquare,
    MoreVertical,
    Pencil,
    Plus,
    Star,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react';
import {toast} from 'sonner';
import {ReviewModal} from './ReviewModal';
import {useCoverLetters, useUserResumes} from '@/src/hooks/useResume';
import {api, apiBlob, ApiError} from '@/src/lib/api';
import {renderCoverLetterAsText} from '@/src/lib/coverLetter';
import {CVData, ResumePreview, ScaledPreview} from './ResumePreview';
import {useLanguage} from "@/src/context/LanguageContext";

// designSource is raw_content — it always carries the authoritative _design block
// (accent colour, font, section order). polished_content from the AI pipeline never
// includes _design, so passing it here would silently reset the colour to the default.
function rawContentToCVData(
    content: Record<string, unknown>,
    designSource?: Record<string, unknown>,
): CVData {
    const design = ((designSource ?? content)._design as Record<string, unknown>) ?? {};

    const skills: string[] = Array.isArray(content.skills)
        ? (content.skills as unknown[])
            .map((s) => (typeof s === 'string' ? s : String((s as Record<string, unknown>)?.skill_name ?? '')))
            .filter(Boolean)
        : [];

    const technicalSkills = Array.isArray(content.skills)
        ? (content.skills as unknown[]).map((s) => {
            const obj = s as Record<string, unknown>;
            const name = typeof s === 'string' ? s : String(obj?.skill_name ?? obj?.name ?? '');
            const prof = typeof s === 'string' ? 'Intermediate' : String(obj?.proficiency ?? 'Intermediate');
            const rating =
                typeof obj?.rating === 'number'
                    ? obj.rating as number
                    : prof === 'Expert'
                        ? 5
                        : prof === 'Advanced'
                            ? 4
                            : prof === 'Intermediate'
                                ? 3
                                : 2;

            const items = Array.isArray(obj?.items)
                ? (obj.items as unknown[]).map((item) => String(item)).filter(Boolean)
                : name
                    ? [name]
                    : [];

            return {
                name,
                category: name,
                level: prof,
                proficiency: prof,
                items,
                rating,
            };
        }).filter((s) => s.name)
        : [];

    const experiences = Array.isArray(content.experiences)
        ? (content.experiences as Record<string, unknown>[]).map((e, i) => ({
            id: String(e.id ?? e.experience_id ?? i),
            title: String(e.role ?? e.job_title ?? e.title ?? ''),
            company: String(e.company_name ?? e.company ?? ''),
            location: String(e.location ?? ''),
            startDate: String(e.start_date ?? e.startDate ?? ''),
            endDate: String(e.end_date ?? e.endDate ?? ''),
            description: String(e.responsibilities ?? e.description ?? ''),
        }))
        : [];

    const education = Array.isArray(content.education)
        ? (content.education as Record<string, unknown>[]).map((e, i) => ({
            id: String(e.id ?? e.education_id ?? i),
            degree: String(e.degree ?? ''),
            school: String(e.university ?? e.institution ?? e.school ?? ''),
            startDate: String(e.start_date ?? e.startDate ?? ''),
            year: String(e.end_date ?? e.end_year ?? e.graduation_year ?? e.year ?? ''),
        }))
        : [];

    const projects = Array.isArray(content.projects)
        ? (content.projects as Record<string, unknown>[]).map((p, i) => ({
            id: String(p.id ?? p.project_id ?? i),
            name: String(p.project_name ?? p.name ?? ''),
            startDate: String(p.start_date ?? p.startDate ?? ''),
            endDate: String(p.end_date ?? p.endDate ?? ''),
            description: String(p.description ?? ''),
            link: String(p.link ?? p.url ?? ''),
        }))
        : [];

    const languages = Array.isArray(content.languages)
        ? (content.languages as Record<string, unknown>[]).map((l, i) => ({
            id: String(l.language_id ?? l.id ?? i),
            language_name: String(l.language_name ?? l.name ?? l.language ?? ''),
            proficiency: String(l.proficiency ?? l.level ?? ''),
        })).filter((l) => l.language_name)
        : [];

    const certifications = Array.isArray(content.certifications)
        ? (content.certifications as Record<string, unknown>[]).map((c, i) => ({
            id: String(c.id ?? c.certification_id ?? i),
            certification_name: String(c.certification_name ?? c.name ?? c.title ?? ''),
            date_obtained: String(c.date_obtained ?? c.date ?? ''),
            issuer: String(c.issuer ?? c.company_name ?? c.institution ?? c.organization ?? ''),
        })).filter((c) => c.certification_name)
        : [];

    const customSections = Array.isArray(design.custom_sections)
        ? (design.custom_sections as Array<Record<string, unknown>>).map((section, i) => ({
            id: String(section.id ?? i),
            title: String(section.title ?? ''),
            items: Array.isArray(section.items)
                ? (section.items as unknown[]).map((item) => String(item))
                : [],
        })).filter((section) => section.title)
        : [];

    const linksRaw = Array.isArray(content.links)
        ? (content.links as Array<Record<string, unknown>>)
        : Array.isArray(content.profiles)
            ? (content.profiles as Array<Record<string, unknown>>)
            : [];

    const onlineLinks = linksRaw.map((link, i) => ({
        id: String(link.id ?? i),
        platform: String(link.platform ?? link.label ?? link.name ?? ''),
        url: String(link.url ?? link.link ?? ''),
    })).filter((link) => link.platform || link.url);

    const linkedinUrl = onlineLinks.find((link) => link.platform.toLowerCase() === 'linkedin')?.url ?? '';

    return {
        personalInfo: {
            fullName: String(content.full_name ?? ''),
            email: String(content.email ?? ''),
            phone: String(content.phone ?? ''),
            location: String(content.address ?? ''),
            title: String(content.target_job_title ?? ''),
            summary: String(content.about ?? ''),
            website: String(content.website ?? ''),
            github: String(content.github ?? ''),
            linkedin: linkedinUrl,
        },
        cvPhoto: (content.photo_url as string) || null,
        onlineLinks,
        workExperience: experiences,
        education,
        skills,
        technicalSkills,
        projects,
        languages,
        certifications,
        customSections,
        sectionOrder: Array.isArray(design.section_order) ? (design.section_order as string[]) : [],
        accentColor: String(design.accent_color ?? '#088395'),
        fontFamily: String(design.font_family ?? 'Inter'),
    };
}

/** The form may save the numeric template id ("11") while ResumePreview expects
 * keys like "template11". Normalize so saved ids resolve to real template components. */
function normalizeTemplateId(raw: unknown): string {
    const value = String(raw ?? '').trim();

    if (!value) return 'template7';
    if (/^\d+$/.test(value)) return `template${value}`;

    return value;
}

interface CoverLetter {
    id: string;
    name: string;
    lastEdited: string;
    jobPosition?: string;
}

interface Resume {
    id: string;
    name: string;
    template: string;
    lastEdited: string;
    isPremium: boolean;
    strength?: number;
}

interface DashboardProps {
    onCreateNew: () => void,
    onEditResume: (resumeId: string, templateId: string) => void,
    onEditCoverLetter?: (coverLetterId: string) => void,
    onCreateCoverLetter?: () => void,
    onUpgrade?: () => void,
    onAnalyzeResume?: () => void,
    onViewJobBoard?: () => void,
    onSubmitReview?: (review: {
        rating: number; text: string; name: string; role: string
    }) => void,
    isPro?: boolean,
}

function LockedFeature({label, onUpgrade}: {
    label: string; onUpgrade?: () => void
}) {
    return (
        <div className="relative group cursor-pointer" onClick={onUpgrade}>
            <div
                className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-xl z-10 flex flex-col items-center justify-center gap-2">
                <div
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock size={18} className="text-gray-400"/>
                </div>
                <p className="text-xs font-semibold text-gray-500">{label}</p>
                <button
                    className="px-3 py-1 bg-[#088395] text-white rounded-full text-xs font-semibold hover:shadow-md transition-all">
                    Upgrade to Pro
                </button>
            </div>
        </div>);
}

function ProBadge() {
    return (<span
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold">
            <Crown size={10}/>
            PRO
        </span>);
}

function UpgradeBanner({onUpgrade, onDismiss}: {
    onUpgrade?: () => void; onDismiss: () => void
}) {
    return (<div
            className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white mb-6 overflow-hidden">
            <div
                className="absolute top-0 right-0 w-40 h-40 bg-[#088395]/20 rounded-full -translate-y-10 translate-x-10"/>
            <button onClick={onDismiss}
                    className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors z-10">
                <X size={16}/>
            </button>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Crown size={16} className="text-yellow-400"/>
                        <span
                            className="text-yellow-400 text-sm font-bold">Upgrade to Pro</span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">
                        Unlock unlimited resumes, AI writing assistant, ATS
                        optimization, and personalized job matches.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {['Unlimited resumes', 'AI writing assistant', 'ATS optimization', 'Job recommendations'].map(f => (
                            <div key={f}
                                 className="flex items-center gap-1 text-xs text-white/70">
                                <CheckCircle size={12}
                                             className="text-[#088395]"/>
                                {f}
                            </div>))}
                    </div>
                    <button onClick={onUpgrade}
                            className="px-5 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm hover:shadow-xl transition-all">
                        Upgrade Now — from €3.99/week
                    </button>
                </div>
                <Star size={48}
                      className="text-white/10 flex-shrink-0 hidden sm:block"/>
            </div>
        </div>);
}

export function Dashboard({
                              onCreateNew,
                              onEditResume,
                              onEditCoverLetter,
                              onCreateCoverLetter,
                              onUpgrade,
                              onAnalyzeResume,
                              onViewJobBoard,
                              onSubmitReview,
                              isPro = false,
                          }: DashboardProps) {
    const {t} = useLanguage();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [applicationCount, setApplicationCount] = useState<number | null>(null);
    const [previewResume, setPreviewResume] = useState<{ cvData: CVData; templateId: string } | null>(null);
    const [previewCoverLetter, setPreviewCoverLetter] = useState<{ title: string; content: string } | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [renameModal, setRenameModal] = useState<{ type: 'resume' | 'cover-letter'; id: string; currentName: string } | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const {
        resumes: realResumes,
        loading: resumesLoading,
        reload: reloadResumes
    } = useUserResumes();

    const resumes: Resume[] = useMemo(() => {
        if (resumesLoading) return [];
        if (realResumes.length === 0) return [];
        return realResumes.map((r) => {
            const raw = (r.raw_content || {}) as Record<string, unknown>;
            const design = ((raw as {
                _design?: { template_id?: string }
            })._design) || {};
            const lastEdited = r.created_at ? new Date(r.created_at).toLocaleString(undefined, {
                dateStyle: "medium", timeStyle: "short"
            }) : "recent";
            return {
                id: r.id,
                name: r.name || r.target_job_title || "Untitled resume",
                template: design.template_id ? `Template ${design.template_id}` : "Default",
                lastEdited,
                isPremium: !!r.premium_analysis,
                strength: undefined,
            };
        });
    }, [realResumes, resumesLoading]);

    const {
        coverLetters: rawCoverLetters,
        loading: coverLettersLoading,
        reload: reloadCoverLetters
    } = useCoverLetters();

    const coverLetters: CoverLetter[] = useMemo(() => {
        if (coverLettersLoading) return [];
        return rawCoverLetters.map((cl) => ({
            id: cl.id,
            name: cl.title || cl.job_position || 'Untitled cover letter',
            lastEdited: cl.created_at ? new Date(cl.created_at).toLocaleString(undefined, {
                dateStyle: 'medium', timeStyle: 'short'
            }) : 'recent',
            jobPosition: cl.job_position ?? undefined,
        }));
    }, [rawCoverLetters, coverLettersLoading]);

    useEffect(() => {
        api.get<unknown[]>('/applications/my-applications')
            .then((data) => setApplicationCount(Array.isArray(data) ? data.length : 0))
            .catch(() => setApplicationCount(0));
    }, []);

    useEffect(() => {
        if (!openMenuId) return;
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [openMenuId]);

    const handleDeleteResume = async (resumeId: string) => {
        if (!confirm("Delete this resume permanently?")) return;
        try {
            await api.delete(`/resume/my-resumes/${resumeId}`);
            toast.success("Resume deleted");
            await reloadResumes();
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : "Failed to delete");
        }
    };

    const handleDownloadResume = async (resumeId: string) => {
        const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
        if (!token) {
            toast.error("Please log in to download");
            return;
        }
        const toastId = toast.loading("Generating PDF…");
        try {
            const blob = await apiBlob(`/resume/my-resumes/${resumeId}/download`);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `resume_${resumeId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("Download ready", {id: toastId});
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Download failed", {id: toastId});
        }
    };

    const handleDownloadCoverLetter = (letter: CoverLetter) => {
        const rawCL = rawCoverLetters.find((cl) => cl.id === letter.id);
        const content = renderCoverLetterAsText(rawCL?.content);
        const blob = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${letter.name}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const openRename = (type: 'resume' | 'cover-letter', id: string, currentName: string) => {
        setRenameModal({type, id, currentName});
        setRenameValue(currentName);
        setOpenMenuId(null);
    };

    const handleRenameSubmit = async () => {
        if (!renameModal) return;
        const name = renameValue.trim();
        if (!name) return;
        try {
            if (renameModal.type === 'resume') {
                await api.patch(`/resume/my-resumes/${renameModal.id}/rename`, {name});
                await reloadResumes();
            } else {
                await api.patch(`/cover-letters/${renameModal.id}`, {title: name});
                await reloadCoverLetters();
            }
            toast.success(t.dashboardPage.renamedSuccessfully);
            setRenameModal(null);
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : t.dashboardPage.failedToRename);
        }
    };

    const handleDeleteCoverLetter = async (coverLetterId: string) => {
        if (!confirm(t.dashboardPage.deleteCoverLetterConfirm)) return;
        try {
            await api.delete(`/cover-letters/${coverLetterId}`);
            toast.success(t.dashboardPage.coverLetterDeleted);
            await reloadCoverLetters();
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : "Failed to delete");
        }
    };

    return (<div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#088395] border-gray-200">
                <div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                    <div
                        className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-white">{t.dashboardPage.title}</h1>
                                {isPro ? (<ProBadge/>) : (<span
                                        className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">{t.dashboardPage.free}</span>)}
                            </div>
                            <p className="text-foreground/70 text-white">{t.dashboardPage.subtitle}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-[#088395]/5 transition-all"
                            >
                                <MessageSquare size={20}/>
                                {t.dashboardPage.leaveReview}
                            </button>
                            {onCreateCoverLetter && (<button
                                    onClick={onCreateCoverLetter}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-[#088395]/5 transition-all"
                                >
                                    <FileText size={20}/>
                                    {t.dashboardPage.createCoverLetter}
                                </button>)}
                            <button
                                onClick={onCreateNew}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 text-[#088395] rounded-lg hover:shadow-xl transition-all"
                            >
                                <Plus size={20}/>
                                {t.dashboardPage.createNewResume}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <FileText size={24}
                                          className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Total
                                    Resumes</p>
                                <p className="text-2xl font-bold">
                                    {resumes.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <Mail size={24}
                                      className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Cover
                                    Letters</p>
                                <p className="text-2xl font-bold">
                                    {coverLetters.length}
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <FileUser size={27}
                                          className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">My
                                    Applications</p>
                                <p className="text-2xl font-bold">
                                    {applicationCount === null ? '—' : applicationCount}
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#088395]/10">
                                <Briefcase size={24}
                                           className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Job
                                    Matches</p>
                                <p className="text-2xl font-bold">
                                    {isPro ? '✓' : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div
                        className="bg-gradient-to-r from-[#088395] to-teal-600 rounded-xl p-6 text-white flex flex-col justify-between">
                        <div>
                            <div
                                className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold">Strengthen
                                    Your Resume</h3>
                                <TrendingUp size={36}
                                            className="text-white/30 flex-shrink-0"/>
                            </div>
                            <p className="text-white/90 text-sm mb-4">
                                Get AI-powered analysis to identify
                                weaknesses and skill gaps before recruiters
                                do.
                            </p>
                        </div>
                        <button
                            onClick={isPro ? onAnalyzeResume : onUpgrade}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
                        >
                            {!isPro && <Lock size={14}/>}
                            Analyze Resume
                            {!isPro && <span
                                className="text-xs bg-[#088395]/10 px-2 py-0.5 rounded-full">Pro</span>}
                        </button>
                    </div>

                    {isPro ? (<div
                            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-between overflow-hidden">
                            <div
                                className="absolute top-0 right-0 w-32 h-32 bg-[#088395]/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none"/>
                            <div
                                className="absolute bottom-0 left-0 w-20 h-20 bg-[#088395]/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none"/>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 mb-1">
                                    <Briefcase size={20}
                                               className="text-[#088395]"/>
                                    <h3 className="text-xl font-bold">Your
                                        Job Matches</h3>
                                </div>
                                <p className="text-white/60 text-xs mb-4">Based
                                    on your latest resume</p>

                            </div>
                            <button onClick={onViewJobBoard}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all mt-4">
                                <Briefcase size={16}/>
                                Browse Job Board
                            </button>
                        </div>) : (<div
                            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-between overflow-hidden">
                            <div
                                className="absolute top-0 right-0 w-32 h-32 bg-[#088395]/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none"/>
                            <div
                                className="absolute bottom-0 left-0 w-20 h-20 bg-[#088395]/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none"/>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 mb-1">
                                    <Briefcase size={20}
                                               className="text-[#088395]"/>
                                    <h3 className="text-xl font-bold">Your
                                        Job Matches</h3>
                                </div>
                                <p className="text-white/60 text-xs mb-4">Based
                                    on your latest resume</p>
                                <div className="flex gap-3 relative">
                                    <div
                                        className="flex gap-3 w-full blur-sm pointer-events-none">
                                        {['90%+ match', '75–90%', 'below 75%'].map(label => (
                                            <div key={label}
                                                 className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-center">
                                                <p className="text-white/40 font-bold text-lg">—</p>
                                                <p className="text-white/30 text-xs">{label}</p>
                                            </div>))}
                                    </div>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                                            <Lock size={11}
                                                  className="text-white/70"/>
                                            <span
                                                className="text-xs text-white/70 font-medium">Upgrade to see breakdown</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onUpgrade}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-xl transition-all mt-4">
                                <Crown size={15}
                                       className="text-yellow-500"/>
                                Upgrade Now — from €3.99/week
                            </button>
                        </div>)}
                </div>

                {/* Resumes */}
                <div className="mb-10">
                    <div
                        className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">My Resumes</h2>
                    </div>

                    <div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => {
                            const rawResume = realResumes.find((r) => r.id === resume.id);
                            const polishedContent = (rawResume?.polished_content || {}) as Record<string, unknown>;
                            const rawOnly = (rawResume?.raw_content || {}) as Record<string, unknown>;

                            // Start from raw_content so _design.template_id, section order,
                            // custom sections, languages, certifications, and links stay present.
                            // Then overlay polished_content so AI-rewritten text wins where it exists.
                            const rawContent = {...rawOnly, ...polishedContent} as Record<string, unknown>;
                            const design = (rawOnly._design as Record<string, unknown>)
                                ?? (rawContent._design as Record<string, unknown>)
                                ?? {};
                            const templateId = normalizeTemplateId(design.template_id ?? rawResume?.template_id);
                            const cvData = rawContentToCVData(rawContent, rawOnly);
                            return (<div key={resume.id}
                                                       className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                                <div
                                    className="cursor-pointer overflow-hidden relative group/thumb"
                                    onClick={() => setPreviewResume({ cvData, templateId })}>
                                    <ScaledPreview templateId={templateId} data={cvData} />
                                    <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover/thumb:opacity-100 transition-opacity bg-black/10">
                                        <span className="px-3 py-1 bg-[#088395] text-white text-xs rounded-full font-semibold">{t.dashboardPage.clickToPreview}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div
                                        className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold mb-1 truncate">{resume.name}</h3>
                                            <p className="text-sm text-foreground/70">{resume.template}</p>
                                            <p className="text-xs text-foreground/50 mt-1">Updated {resume.lastEdited}</p>
                                        </div>
                                        <div className="relative shrink-0" ref={openMenuId === resume.id ? menuRef : null}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === resume.id ? null : resume.id); }}
                                                className="p-2 hover:bg-gray-100 rounded-lg">
                                                <MoreVertical size={16}/>
                                            </button>
                                            {openMenuId === resume.id && (
                                                <div className="absolute right-0 top-9 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRename('resume', resume.id, resume.name)}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Pencil size={14}/> {t.dashboardPage.rename}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setOpenMenuId(null); handleDeleteResume(resume.id); }}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                                    >
                                                        <Trash2 size={14}/> {t.dashboardPage.delete}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {resume.strength && (
                                        <div className="mb-3">
                                            <div
                                                className="flex items-center justify-between text-xs mb-1">
                                                <span
                                                    className="text-foreground/70">{t.dashboardPage.resumeStrength}</span>
                                                <span
                                                    className="font-semibold text-[#088395]">{resume.strength}%</span>
                                            </div>
                                            <div
                                                className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#088395] rounded-full"
                                                    style={{width: `${resume.strength}%`}}></div>
                                            </div>
                                        </div>)}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEditResume(resume.id, templateId)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2">
                                            <Eye
                                                size={16}/><span>{t.dashboardPage.edit}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadResume(resume.id)}
                                            title={t.dashboardPage.downloadPdf}
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"
                                        ><Download size={16}/></button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteResume(resume.id)}
                                            title={t.dashboardPage.deleteResume}
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                                        ><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>);
                        })}

                        {!resumesLoading && resumes.length === 0 && (<div
                                className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <FileText size={36}
                                          className="mx-auto text-gray-300 mb-2"/>
                                <p className="text-foreground/70 mb-3">{t.dashboardPage.noResumes}</p>
                                <button
                                    onClick={onCreateNew}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    <Plus size={16}/> {t.dashboardPage.createFirstResume}
                                </button>
                            </div>)}
                        {resumesLoading && (<div
                                className="col-span-full text-center py-12 text-foreground/50">
                                {t.dashboardPage.loadingResumes}
                            </div>)}

                    </div>
                </div>

                {/* Cover Letters */}
                <div className="mt-12">
                    <div
                        className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">{t.dashboardPage.myCoverLetters}</h2>
                    </div>
                    <div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coverLetters.map((letter) => {
                            const rawCL = rawCoverLetters.find((cl) => cl.id === letter.id);
                            const clContent = renderCoverLetterAsText(rawCL?.content);
                            return (<div key={letter.id}
                                                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                                <div
                                    className="aspect-[8.5/11] bg-gray-50 p-5 cursor-pointer overflow-hidden relative"
                                    onClick={() => setPreviewCoverLetter({ title: letter.name, content: clContent })}>
                                    <div className="h-full overflow-hidden">
                                        <div className="h-3 bg-[#088395]/20 rounded w-2/3 mb-3"></div>
                                        <p className="text-[7px] leading-[1.6] text-gray-600 whitespace-pre-wrap line-clamp-[30]">
                                            {clContent || t.dashboardPage.noContentYet}
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                        <span className="px-3 py-1 bg-[#088395] text-white text-xs rounded-full font-semibold">{t.dashboardPage.clickToPreview}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div
                                        className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold mb-1 truncate">{letter.name}</h3>
                                            <p className="text-xs text-foreground/50 mt-1">Updated {letter.lastEdited}</p>
                                        </div>
                                        <div className="relative shrink-0" ref={openMenuId === letter.id ? menuRef : null}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === letter.id ? null : letter.id); }}
                                                className="p-2 hover:bg-gray-100 rounded-lg">
                                                <MoreVertical size={16}/>
                                            </button>
                                            {openMenuId === letter.id && (
                                                <div className="absolute right-0 top-9 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRename('cover-letter', letter.id, letter.name)}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Pencil size={14}/> {t.dashboardPage.rename}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setOpenMenuId(null); handleDeleteCoverLetter(letter.id); }}
                                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                                    >
                                                        <Trash2 size={14}/> {t.dashboardPage.delete}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEditCoverLetter?.(letter.id)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye
                                                size={16}/><span>{t.dashboardPage.edit}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadCoverLetter(letter)}
                                            title={t.dashboardPage.downloadText}
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors">
                                            <Download size={16}/></button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCoverLetter(letter.id)}
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                                        ><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>);
                        })}

                        {!coverLettersLoading && coverLetters.length === 0 && (
                            <div
                                className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <Mail size={36}
                                      className="mx-auto text-gray-300 mb-2"/>
                                <p className="text-foreground/70 mb-3">{t.dashboardPage.noCoverLetters}</p>
                                {onCreateCoverLetter && (<button
                                        onClick={onCreateCoverLetter}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
                                    >
                                        <Plus size={16}/> {t.dashboardPage.createFirstCoverLetter}
                                    </button>)}
                            </div>)}
                        {coverLettersLoading && (<div
                                className="col-span-full text-center py-12 text-foreground/50">
                                {t.dashboardPage.loadingCoverLetters}
                            </div>)}
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12">
                    {isPro ? (<>
                            <div
                                className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Recommended
                                    Courses</h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {[{
                                    title: 'The Complete SQL Bootcamp',
                                    provider: 'Udemy',
                                    duration: '9 hrs',
                                    level: 'Beginner',
                                    tag: 'In demand'
                                }, {
                                    title: 'System Design for Interviews',
                                    provider: 'Coursera',
                                    duration: '12 hrs',
                                    level: 'Intermediate',
                                    tag: 'Trending'
                                }, {
                                    title: 'AWS Cloud Practitioner Essentials',
                                    provider: 'AWS',
                                    duration: '6 hrs',
                                    level: 'Beginner',
                                    tag: 'Boosts salary'
                                },].map((course, i) => (<div key={i}
                                                             className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        <div
                                            className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm mb-1">{course.title}</h4>
                                                <p className="text-xs text-foreground/60">{course.provider} · {course.duration} · {course.level}</p>
                                            </div>
                                            <span
                                                className="ml-2 px-2 py-0.5 bg-[#088395]/10 text-[#088395] rounded-full text-xs font-semibold whitespace-nowrap">{course.tag}</span>
                                        </div>
                                        <button
                                            className="w-full py-2 border border-[#088395] text-[#088395] rounded-lg text-sm font-semibold hover:bg-[#088395]/5 transition-colors">
                                            {t.dashboardPage.viewCourse}
                                        </button>
                                    </div>))}
                            </div>
                        </>) : (<>
                            <div
                                className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Recommended
                                    Jobs</h2>
                                <button onClick={onViewJobBoard}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#088395] text-[#088395] rounded-lg text-sm font-semibold hover:bg-[#088395]/5 transition-colors">
                                    {t.dashboardPage.viewAllJobs}
                                </button>
                            </div>
                            <div
                                className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center overflow-hidden">
                                <div
                                    className="absolute inset-0 p-6 blur-sm pointer-events-none">
                                    <div
                                        className="grid grid-cols-3 gap-4">
                                        {[94, 88, 82].map(score => (
                                            <div key={score}
                                                 className="bg-gray-50 rounded-lg p-4">
                                                <div
                                                    className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div
                                                    className="h-2 bg-gray-100 rounded w-1/2 mb-3"></div>
                                                <div
                                                    className="h-6 bg-[#088395]/20 rounded"></div>
                                            </div>))}
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <div
                                        className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock size={24}
                                              className="text-gray-400"/>
                                    </div>
                                    <h3 className="font-semibold mb-2">Unlock
                                        Job Recommendations</h3>
                                    <p className="text-foreground/70 text-sm mb-4 max-w-sm mx-auto">
                                        Upgrade to Pro to get personalized
                                        job matches based on your resume
                                        and skills
                                    </p>
                                    <button onClick={onUpgrade}
                                            className="px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all font-semibold">
                                        Upgrade to Pro
                                    </button>
                                </div>
                            </div>
                        </>)}
                </div>
            </div>

            {/* Resume fullscreen preview modal */}
            {previewResume && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewResume(null)}>
                    <div className="relative bg-white rounded-xl shadow-2xl overflow-auto max-h-[90vh] max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewResume(null)}
                            className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                            <X size={18} />
                        </button>
                        <div className="p-2">
                            <ResumePreview templateId={previewResume.templateId} data={previewResume.cvData} />
                        </div>
                    </div>
                </div>
            )}

            {/* Cover letter fullscreen preview modal */}
            {previewCoverLetter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewCoverLetter(null)}>
                    <div className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] max-w-2xl w-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold truncate">{previewCoverLetter.title}</h3>
                            <button onClick={() => setPreviewCoverLetter(null)} className="p-2 hover:bg-gray-100 rounded-full ml-4">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="overflow-y-auto px-8 py-6">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                                {previewCoverLetter.content || t.dashboardPage.noContentYet}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {renameModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setRenameModal(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4">
                            {t.dashboardPage.rename} {renameModal.type === 'resume' ? t.dashboardPage.resume : t.dashboardPage.coverLetter}
                        </h3>
                        <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit();
                                if (e.key === 'Escape') setRenameModal(null);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none mb-4"
                            placeholder={t.dashboardPage.enterNewName}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setRenameModal(null)}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                {t.dashboardPage.cancel}
                            </button>
                            <button
                                type="button"
                                onClick={handleRenameSubmit}
                                disabled={!renameValue.trim()}
                                className="px-4 py-2 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
                            >
                                {t.dashboardPage.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}

           <ReviewModal
  isOpen={showReviewModal}
  onClose={() => setShowReviewModal(false)}
  onSubmit={(review) => {
    onSubmitReview?.(review);
  }}
            />
        </div>);
}
