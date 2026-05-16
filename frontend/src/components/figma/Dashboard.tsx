"use client";
import { useMemo, useState } from 'react';
import {
    FileText, Plus, MoreVertical, Download, Eye, Trash2, Copy,
    TrendingUp, Briefcase, MessageSquare, Mail,
    Lock, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { ReviewModal } from './ReviewModal';
import { useUserResumes } from '@/src/hooks/useResume';
import { api, ApiError } from '@/src/lib/api';
import { useLanguage } from '@/src/context/LanguageContext';

interface Resume {
    id: string;
    name: string;
    template: string;
    lastEdited: string;
    isPremium: boolean;
    strength?: number;
}

interface DashboardProps {
    onCreateNew: () => void;
    onEditResume: (resumeId: string) => void;
    onCreateCoverLetter?: () => void;
    onUpgrade?: () => void;
    onAnalyzeResume?: () => void;
    onViewJobBoard?: () => void;
    onSubmitReview?: (review: { rating: number; text: string; name: string; role: string }) => void;
    isPro?: boolean;
    onTogglePlan?: () => void;
}

function ProBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold">
            <Crown size={10} />
            {label}
        </span>
    );
}

export function Dashboard({
    onCreateNew,
    onEditResume,
    onCreateCoverLetter,
    onUpgrade,
    onAnalyzeResume,
    onViewJobBoard,
    onSubmitReview,
    isPro = false,
    onTogglePlan,
}: DashboardProps) {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const { resumes: realResumes, loading: resumesLoading, reload: reloadResumes } = useUserResumes();
    const { t } = useLanguage();
    const copy = t.dashboardPage;

    const resumes: Resume[] = useMemo(() => {
        if (resumesLoading) return [];
        if (realResumes.length === 0) return [];
        return realResumes.map((r) => {
            const raw = (r.raw_content || {}) as Record<string, unknown>;
            const design = ((raw as { _design?: { template_id?: string } })._design) || {};
            const lastEdited = r.created_at
                ? new Date(r.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                : copy.recent;
            return {
                id: r.id,
                name: r.target_job_title || copy.fallbackResumeName,
                template: design.template_id ? `${copy.templateLabel} ${design.template_id}` : copy.defaultTemplate,
                lastEdited,
                isPremium: !!r.premium_analysis,
                strength: undefined,
            };
        });
    }, [copy.defaultTemplate, copy.fallbackResumeName, copy.recent, copy.templateLabel, realResumes, resumesLoading]);

    const coverLetters = copy.sampleCoverLetters.map((letter, index) => ({ id: String(index + 1), ...letter }));

    const visibleResumes = resumes;
    const visibleCoverLetters = coverLetters;

    const handleDeleteResume = async (resumeId: string) => {
        if (!confirm(copy.confirmDelete)) return;
        try {
            await api.delete(`/resume/my-resumes/${resumeId}`);
            toast.success(copy.resumeDeleted);
            await reloadResumes();
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : copy.failedToDelete);
        }
    };

    const handleDownloadResume = async (resumeId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8091";
        const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
        if (!token) {
            toast.error(copy.pleaseLoginToDownload);
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/resume/my-resumes/${resumeId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Download failed (${res.status})`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `resume_${resumeId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : copy.downloadFailed);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold">{copy.title}</h1>
                                {isPro ? (
                                    <ProBadge label={copy.pro} />
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">{copy.free}</span>
                                )}
                            </div>
                            <p className="text-foreground/70">{copy.subtitle}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Dev toggle — remove in production */}
                            {onTogglePlan && (
                                <button
                                    onClick={onTogglePlan}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                                        isPro
                                            ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                                            : 'border-gray-300 text-gray-500 hover:border-[#088395] hover:text-[#088395]'
                                    }`}
                                >
                                    <Crown size={14} />
                                    {isPro ? copy.switchToFree : copy.switchToPro}
                                </button>
                            )}
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg hover:bg-[#088395]/5 transition-all"
                            >
                                <MessageSquare size={20} />
                                {copy.leaveReview}
                            </button>
                            {onCreateCoverLetter && (
                                <button
                                    onClick={onCreateCoverLetter}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg hover:bg-[#088395]/5 transition-all"
                                >
                                    <FileText size={20} />
                                    {copy.createCoverLetter}
                                </button>
                            )}
                            <button
                                onClick={onCreateNew}
                                className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
                            >
                                <Plus size={20} />
                                {copy.createNewResume}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <FileText size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">{copy.stats.totalResumes}</p>
                                <p className="text-2xl font-bold">
                                    {resumes.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <Mail size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">{copy.stats.coverLetters}</p>
                                <p className="text-2xl font-bold">
                                    {coverLetters.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                <TrendingUp size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">{copy.stats.avgStrength}</p>
                                <p className="text-2xl font-bold">
                                    {Math.round(resumes.reduce((acc, r) => acc + (r.strength || 0), 0) / resumes.length)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-sm border bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#088395]/10">
                                <Briefcase size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">{copy.stats.jobMatches}</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-[#088395] to-teal-600 rounded-xl p-6 text-white flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold">{copy.strengthenTitle}</h3>
                                <TrendingUp size={36} className="text-white/30 flex-shrink-0" />
                            </div>
                            <p className="text-white/90 text-sm mb-4">
                                {copy.strengthenDescription}
                            </p>
                        </div>
                        <button
                            onClick={isPro ? onAnalyzeResume : onUpgrade}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
                        >
                            {!isPro && <Lock size={14} />}
                            {copy.analyzeResume}
                            {!isPro && <span className="text-xs bg-[#088395]/10 px-2 py-0.5 rounded-full">{copy.pro}</span>}
                        </button>
                    </div>

                    {isPro ? (
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#088395]/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#088395]/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-1">
                                    <Briefcase size={20} className="text-[#088395]" />
                                    <h3 className="text-xl font-bold">{copy.yourJobMatches}</h3>
                                </div>
                                <p className="text-white/60 text-xs mb-4">{copy.basedOnLatestResume}</p>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-center">
                                        <p className="text-emerald-400 font-bold text-lg">4</p>
                                        <p className="text-white/50 text-xs">{copy.match90}</p>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-center">
                                        <p className="text-yellow-400 font-bold text-lg">5</p>
                                        <p className="text-white/50 text-xs">75–90%</p>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-center">
                                        <p className="text-white/70 font-bold text-lg">3</p>
                                        <p className="text-white/50 text-xs">{copy.matchBelow75}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onViewJobBoard} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all mt-4">
                                <Briefcase size={16} />
                                {copy.browseJobBoard}
                            </button>
                        </div>
                    ) : (
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#088395]/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#088395]/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-1">
                                    <Briefcase size={20} className="text-[#088395]" />
                                    <h3 className="text-xl font-bold">{copy.yourJobMatches}</h3>
                                </div>
                                <p className="text-white/60 text-xs mb-4">{copy.basedOnLatestResume}</p>
                                <div className="flex gap-3 relative">
                                    <div className="flex gap-3 w-full blur-sm pointer-events-none">
                                        {[copy.match90, '75–90%', copy.matchBelow75].map(label => (
                                            <div key={label} className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-center">
                                                <p className="text-white/40 font-bold text-lg">—</p>
                                                <p className="text-white/30 text-xs">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                                            <Lock size={11} className="text-white/70" />
                                            <span className="text-xs text-white/70 font-medium">{copy.upgradeToSeeBreakdown}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onUpgrade} className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-xl transition-all mt-4">
                                <Crown size={15} className="text-yellow-500" />
                                {copy.upgradeNow}
                            </button>
                        </div>
                    )}
                </div>

                {/* Resumes */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">{copy.myResumes}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleResumes.map((resume) => (
                            <div key={resume.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                                <div className="aspect-[8.5/11] bg-gray-100 p-4 cursor-pointer" onClick={() => onEditResume(resume.id)}>
                                    <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
                                        <div className="h-2 bg-[#088395]/30 rounded w-3/4"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                                        <div className="pt-3 space-y-1.5">
                                            <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                            <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                            <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{resume.name}</h3>
                                            <p className="text-sm text-foreground/70">{resume.template}</p>
                                            <p className="text-xs text-foreground/50 mt-1">{copy.updated} {resume.lastEdited}</p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={16} /></button>
                                    </div>
                                    {resume.strength && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-foreground/70">{copy.resumeStrength}</span>
                                                <span className="font-semibold text-[#088395]">{resume.strength}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#088395] rounded-full" style={{ width: `${resume.strength}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button onClick={() => onEditResume(resume.id)} className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2">
                                            <Eye size={16} /><span>{copy.edit}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadResume(resume.id)}
                                            title={copy.downloadPdf}
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"
                                        ><Download size={16} /></button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteResume(resume.id)}
                                            title={copy.deleteResume}
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                                        ><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!resumesLoading && visibleResumes.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <FileText size={36} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-foreground/70 mb-3">{copy.noResumes}</p>
                                <button
                                    onClick={onCreateNew}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    <Plus size={16} /> {copy.createFirstResume}
                                </button>
                            </div>
                        )}
                        {resumesLoading && (
                            <div className="col-span-full text-center py-12 text-foreground/50">
                                {copy.loadingResumes}
                            </div>
                        )}

                    </div>
                </div>

                {/* Cover Letters */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">{copy.myCoverLetters}</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleCoverLetters.map((letter) => (
                            <div key={letter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                                <div className="aspect-[8.5/11] bg-gray-100 p-4">
                                    <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
                                        <div className="h-2 bg-[#088395]/30 rounded w-3/4"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                                        <div className="pt-3 space-y-1.5">
                                            <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                            <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                            <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{letter.name}</h3>
                                            <p className="text-xs text-foreground/50 mt-1">{copy.updated} {letter.lastEdited}</p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={16} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2">
                                            <Eye size={16} /><span>{copy.edit}</span>
                                        </button>
                                        <button className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"><Download size={16} /></button>
                                        <button className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"><Copy size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12">
                    {isPro ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">{copy.recommendedCourses}</h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {copy.recommendedCourseItems.map((course, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm mb-1">{course.title}</h4>
                                                <p className="text-xs text-foreground/60">{course.provider} · {course.duration} · {course.level}</p>
                                            </div>
                                            <span className="ml-2 px-2 py-0.5 bg-[#088395]/10 text-[#088395] rounded-full text-xs font-semibold whitespace-nowrap">{course.tag}</span>
                                        </div>
                                        <button className="w-full py-2 border border-[#088395] text-[#088395] rounded-lg text-sm font-semibold hover:bg-[#088395]/5 transition-colors">
                                            {copy.viewCourse}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">{copy.recommendedJobs}</h2>
                                <button onClick={onViewJobBoard} className="flex items-center gap-2 px-4 py-2 border-2 border-[#088395] text-[#088395] rounded-lg text-sm font-semibold hover:bg-[#088395]/5 transition-colors">
                                    {copy.viewAllJobs}
                                </button>
                            </div>
                            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center overflow-hidden">
                                <div className="absolute inset-0 p-6 blur-sm pointer-events-none">
                                    <div className="grid grid-cols-3 gap-4">
                                        {[94, 88, 82].map(score => (
                                            <div key={score} className="bg-gray-50 rounded-lg p-4">
                                                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-2 bg-gray-100 rounded w-1/2 mb-3"></div>
                                                <div className="h-6 bg-[#088395]/20 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock size={24} className="text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{copy.unlockJobRecommendations}</h3>
                                    <p className="text-foreground/70 text-sm mb-4 max-w-sm mx-auto">
                                        {copy.upgradeForJobMatches}
                                    </p>
                                    <button onClick={onUpgrade} className="px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all font-semibold">
                                        {copy.upgradeToPro}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={(review) => {
                    onSubmitReview?.(review);
                    alert(copy.reviewThanks);
                }}
            />
        </div>
    );
}
