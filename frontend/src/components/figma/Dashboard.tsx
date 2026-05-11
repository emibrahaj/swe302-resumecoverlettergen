"use client";
import { useState } from 'react';
import {
    FileText, Plus, MoreVertical, Download, Eye, Trash2, Copy,
    Star, TrendingUp, Briefcase, MessageSquare, Mail,
    Lock, Crown, Zap, CheckCircle, X
} from 'lucide-react';
import { ReviewModal } from './ReviewModal';

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
    onSubmitReview?: (review: { rating: number; text: string; name: string; role: string }) => void;
    isPro?: boolean;
    onTogglePlan?: () => void;
}

function LockedFeature({ label, onUpgrade }: { label: string; onUpgrade?: () => void }) {
    return (
        <div className="relative group cursor-pointer" onClick={onUpgrade}>
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-xl z-10 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock size={18} className="text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-500">{label}</p>
                <button className="px-3 py-1 bg-[#088395] text-white rounded-full text-xs font-semibold hover:shadow-md transition-all">
                    Upgrade to Pro
                </button>
            </div>
        </div>
    );
}

function ProBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold">
            <Crown size={10} />
            PRO
        </span>
    );
}

function UpgradeBanner({ onUpgrade, onDismiss }: { onUpgrade?: () => void; onDismiss: () => void }) {
    return (
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#088395]/20 rounded-full -translate-y-10 translate-x-10" />
            <button onClick={onDismiss} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors z-10">
                <X size={16} />
            </button>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Crown size={16} className="text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-bold">Upgrade to Pro</span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">
                        Unlock unlimited resumes, AI writing assistant, ATS optimization, and personalized job matches.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {['Unlimited resumes', 'AI writing assistant', 'ATS optimization', 'Job recommendations'].map(f => (
                            <div key={f} className="flex items-center gap-1 text-xs text-white/70">
                                <CheckCircle size={12} className="text-[#088395]" />
                                {f}
                            </div>
                        ))}
                    </div>
                    <button onClick={onUpgrade} className="px-5 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm hover:shadow-xl transition-all">
                        Upgrade Now — from €4.99/week
                    </button>
                </div>
                <Star size={48} className="text-white/10 flex-shrink-0 hidden sm:block" />
            </div>
        </div>
    );
}

export function Dashboard({
    onCreateNew,
    onEditResume,
    onCreateCoverLetter,
    onUpgrade,
    onAnalyzeResume,
    onSubmitReview,
    isPro = false,
    onTogglePlan,
}: DashboardProps) {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);

    const [resumes] = useState<Resume[]>([
        { id: '1', name: 'Software Engineer Resume', template: 'Modern Minimal', lastEdited: '2 hours ago', isPremium: false, strength: 85 },
        { id: '2', name: 'Product Manager CV', template: 'Executive Elite', lastEdited: '1 day ago', isPremium: true, strength: 92 },
        { id: '3', name: 'Frontend Developer', template: 'Tech Innovator', lastEdited: '3 days ago', isPremium: false, strength: 78 },
    ]);

    const [coverLetters] = useState([
        { id: '1', name: 'Google Application', lastEdited: '1 day ago' },
        { id: '2', name: 'Frontend Role Cover Letter', lastEdited: '3 days ago' },
    ]);

    // Free plan limits
    const FREE_RESUME_LIMIT = 1;
    const FREE_COVER_LETTER_LIMIT = 1;
    const visibleResumes = isPro ? resumes : resumes.slice(0, FREE_RESUME_LIMIT);
    const lockedResumeCount = isPro ? 0 : resumes.length - FREE_RESUME_LIMIT;
    const visibleCoverLetters = isPro ? coverLetters : coverLetters.slice(0, FREE_COVER_LETTER_LIMIT);
    const lockedCoverLetterCount = isPro ? 0 : coverLetters.length - FREE_COVER_LETTER_LIMIT;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold">My Dashboard</h1>
                                {isPro ? (
                                    <ProBadge />
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">FREE</span>
                                )}
                            </div>
                            <p className="text-foreground/70">Manage your resumes and track your progress</p>
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
                                    {isPro ? 'Switch to Free' : 'Switch to Pro'}
                                </button>
                            )}
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg hover:bg-[#088395]/5 transition-all"
                            >
                                <MessageSquare size={20} />
                                Leave Review
                            </button>
                            {onCreateCoverLetter && (
                                <button
                                    onClick={isPro ? onCreateCoverLetter : onUpgrade}
                                    className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-all ${
                                        isPro
                                            ? 'border-[#088395] text-[#088395] hover:bg-[#088395]/5'
                                            : 'border-gray-300 text-gray-400 cursor-pointer'
                                    }`}
                                >
                                    <FileText size={20} />
                                    Create Cover Letter
                                    {!isPro && <Lock size={14} className="text-gray-400" />}
                                </button>
                            )}
                            <button
                                onClick={onCreateNew}
                                className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
                            >
                                <Plus size={20} />
                                Create New Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Upgrade banner (free only) */}
                {!isPro && showUpgradeBanner && (
                    <UpgradeBanner onUpgrade={onUpgrade} onDismiss={() => setShowUpgradeBanner(false)} />
                )}

                {/* Pro active banner */}
                {isPro && (
                    <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                            <Crown size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">You&apos;re on Pro</p>
                            <p className="text-xs text-foreground/60">All features unlocked — enjoy unlimited resumes, AI tools, and job matches.</p>
                        </div>
                        <Zap size={20} className="text-yellow-500 ml-auto flex-shrink-0" />
                    </div>
                )}

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <FileText size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Total Resumes</p>
                                <p className="text-2xl font-bold">
                                    {isPro ? resumes.length : `${FREE_RESUME_LIMIT}/${resumes.length}`}
                                </p>
                                {!isPro && <p className="text-xs text-gray-400">Free limit</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <Mail size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Cover Letters</p>
                                <p className="text-2xl font-bold">
                                    {isPro ? coverLetters.length : `${FREE_COVER_LETTER_LIMIT}/${coverLetters.length}`}
                                </p>
                                {!isPro && <p className="text-xs text-gray-400">Free limit</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                <TrendingUp size={24} className="text-[#088395]" />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Avg Strength</p>
                                <p className="text-2xl font-bold">
                                    {Math.round(resumes.reduce((acc, r) => acc + (r.strength || 0), 0) / resumes.length)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl shadow-sm border p-6 ${isPro ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isPro ? 'bg-[#088395]/10' : 'bg-gray-200'}`}>
                                <Briefcase size={24} className={isPro ? 'text-[#088395]' : 'text-gray-400'} />
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Job Matches</p>
                                {isPro ? (
                                    <p className="text-2xl font-bold">12</p>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Lock size={14} className="text-gray-400" />
                                        <p className="text-sm text-gray-400 font-medium">Pro only</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-[#088395] to-teal-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Strengthen Your Resume</h3>
                                <p className="text-white/90 text-sm mb-4">
                                    Get AI-powered analysis to identify weaknesses and skill gaps
                                </p>
                            </div>
                            <TrendingUp size={40} className="text-white/40" />
                        </div>
                        <button
                            onClick={isPro ? onAnalyzeResume : onUpgrade}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
                        >
                            {!isPro && <Lock size={14} />}
                            Analyze Resume
                            {!isPro && <span className="text-xs bg-[#088395]/10 px-2 py-0.5 rounded-full">Pro</span>}
                        </button>
                    </div>

                    {isPro ? (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown size={20} className="text-yellow-500" />
                                        <h3 className="text-xl font-bold">Pro Active</h3>
                                    </div>
                                    <p className="text-foreground/70 text-sm mb-4">
                                        You have access to all features. Keep building your career!
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {['Unlimited resumes', 'AI assistant', 'ATS optimizer', 'Job matches'].map(f => (
                                    <div key={f} className="flex items-center gap-1.5 text-sm text-foreground/70">
                                        <CheckCircle size={14} className="text-[#088395]" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                                    <p className="text-white/90 text-sm mb-4">
                                        Unlock all features including job recommendations and unlimited templates
                                    </p>
                                </div>
                                <Star size={40} className="text-white/40" />
                            </div>
                            <button onClick={onUpgrade} className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-xl">
                                Upgrade Now — from €4.99/week
                            </button>
                        </div>
                    )}
                </div>

                {/* Resumes */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">My Resumes</h2>
                        {!isPro && (
                            <span className="text-sm text-gray-400">
                                {FREE_RESUME_LIMIT} of {resumes.length} shown —{' '}
                                <button onClick={onUpgrade} className="text-[#088395] font-semibold hover:underline">
                                    Upgrade for all
                                </button>
                            </span>
                        )}
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
                                            <p className="text-xs text-foreground/50 mt-1">Updated {resume.lastEdited}</p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={16} /></button>
                                    </div>
                                    {resume.strength && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-foreground/70">Resume Strength</span>
                                                <span className="font-semibold text-[#088395]">{resume.strength}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#088395] rounded-full" style={{ width: `${resume.strength}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button onClick={() => onEditResume(resume.id)} className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2">
                                            <Eye size={16} /><span>Edit</span>
                                        </button>
                                        <button className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"><Download size={16} /></button>
                                        <button className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"><Copy size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Locked resume placeholders */}
                        {!isPro && Array.from({ length: lockedResumeCount }).map((_, i) => (
                            <div key={`locked-resume-${i}`} className="relative bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 overflow-hidden">
                                {/* Blurred preview */}
                                <div className="aspect-[8.5/11] bg-gray-50 p-4 blur-sm">
                                    <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
                                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </div>
                                <div className="p-4 blur-sm">
                                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                </div>
                                <LockedFeature label="Pro Resume" onUpgrade={onUpgrade} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cover Letters */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">My Cover Letters</h2>
                        {!isPro && (
                            <span className="text-sm text-gray-400">
                                {FREE_COVER_LETTER_LIMIT} of {coverLetters.length} shown —{' '}
                                <button onClick={onUpgrade} className="text-[#088395] font-semibold hover:underline">
                                    Upgrade for all
                                </button>
                            </span>
                        )}
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
                                            <p className="text-xs text-foreground/50 mt-1">Updated {letter.lastEdited}</p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={16} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2">
                                            <Eye size={16} /><span>Edit</span>
                                        </button>
                                        <button className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"><Download size={16} /></button>
                                        <button className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"><Copy size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Locked cover letter placeholders */}
                        {!isPro && Array.from({ length: lockedCoverLetterCount }).map((_, i) => (
                            <div key={`locked-cl-${i}`} className="relative bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 overflow-hidden">
                                <div className="aspect-[8.5/11] bg-gray-50 p-4 blur-sm">
                                    <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
                                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                                <div className="p-4 blur-sm">
                                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                                </div>
                                <LockedFeature label="Pro Cover Letter" onUpgrade={onUpgrade} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Job Recommendations */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Recommended Jobs</h2>
                    {isPro ? (
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { title: 'Senior Frontend Developer', company: 'Stripe', location: 'Remote', match: 94 },
                                { title: 'React Engineer', company: 'Vercel', location: 'San Francisco, CA', match: 88 },
                                { title: 'Full Stack Developer', company: 'Linear', location: 'Remote', match: 82 },
                            ].map((job, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-sm">{job.title}</h4>
                                            <p className="text-xs text-foreground/60 mt-0.5">{job.company} · {job.location}</p>
                                        </div>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{job.match}%</span>
                                    </div>
                                    <button className="w-full py-2 border border-[#088395] text-[#088395] rounded-lg text-sm font-semibold hover:bg-[#088395]/5 transition-colors">
                                        View Job
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center overflow-hidden">
                            {/* Blurred fake jobs in background */}
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
                                <h3 className="font-semibold mb-2">Unlock Job Recommendations</h3>
                                <p className="text-foreground/70 text-sm mb-4 max-w-sm mx-auto">
                                    Upgrade to Pro to get personalized job matches based on your resume and skills
                                </p>
                                <button onClick={onUpgrade} className="px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all font-semibold">
                                    Upgrade to Pro
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={(review) => {
                    onSubmitReview?.(review);
                    alert('Thank you for your review! It will appear on the homepage soon.');
                }}
            />
        </div>
    );
}