"use client";
import {useState} from 'react';
import {
    FileText,
    Plus,
    MoreVertical,
    Download,
    Eye,
    Trash2,
    Copy,
    Star,
    TrendingUp,
    Briefcase,
    MessageSquare, Mail
} from 'lucide-react';
import {ReviewModal} from './ReviewModal';

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
}

export function Dashboard({
                              onCreateNew,
                              onEditResume,
                              onCreateCoverLetter,
                              onUpgrade,
                              onAnalyzeResume,
                              onSubmitReview
                          }: DashboardProps) {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [resumes] = useState<Resume[]>([
        {
            id: '1',
            name: 'Software Engineer Resume',
            template: 'Modern Minimal',
            lastEdited: '2 hours ago',
            isPremium: false,
            strength: 85
        },
        {
            id: '2',
            name: 'Product Manager CV',
            template: 'Executive Elite',
            lastEdited: '1 day ago',
            isPremium: true,
            strength: 92
        },
        {
            id: '3',
            name: 'Frontend Developer',
            template: 'Tech Innovator',
            lastEdited: '3 days ago',
            isPremium: false,
            strength: 78
        }
    ]);
    const [coverLetters] = useState([
        {
            id: '1',
            name: 'Google Application',
            lastEdited: '1 day ago'
        },
        {
            id: '2',
            name: 'Frontend Role Cover Letter',
            lastEdited: '3 days ago'
        }
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                            <p className="text-foreground/70">Manage your resumes and track your progress</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg hover:bg-[#088395]/5 transition-all"
                            >
                                <MessageSquare size={20}/>
                                Leave Review
                            </button>
                            {onCreateCoverLetter && (
                                <button
                                    onClick={onCreateCoverLetter}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg hover:bg-[#088395]/5 transition-all"
                                >
                                    <FileText size={20}/>
                                    Create Cover Letter
                                </button>
                            )}
                            <button
                                onClick={onCreateNew}
                                className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
                            >
                                <Plus size={20}/>
                                Create New Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <FileText size={24} className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Total Resumes</p>
                                <p className="text-2xl font-bold">{resumes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <Mail size={24} className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Total Cover Letters</p>
                                <p className="text-2xl font-bold">2</p> {/* later make dynamic */}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                <TrendingUp size={24} className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Avg Strength</p>
                                <p className="text-2xl font-bold">
                                    {Math.round(
                                        resumes.reduce((acc, r) => acc + (r.strength || 0), 0) / resumes.length
                                    )}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <Briefcase size={24} className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Job Matches</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-[#088395] to-teal-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Strengthen Your Resume</h3>
                                <p className="text-white/90 text-sm mb-4">
                                    Get AI-powered analysis to identify weaknesses and skill gaps
                                </p>
                            </div>
                            <TrendingUp size={40} className="text-white/40"/>
                        </div>
                        <button
                            onClick={onAnalyzeResume}
                            className="px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
                        >
                            Analyze Resume
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                                <p className="text-white/90 text-sm mb-4">
                                    Unlock all features including job recommendations and unlimited templates
                                </p>
                            </div>
                            <Star size={40} className="text-white/40"/>
                        </div>
                        <button
                            onClick={onUpgrade}
                            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-xl">
                            Upgrade Now - $9.99/month
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">My Resumes</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                <div className="aspect-[8.5/11] bg-gray-100 p-4 cursor-pointer"
                                     onClick={() => onEditResume(resume.id)}>
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
                                            <p className="text-xs text-foreground/50 mt-1">
                                                Updated {resume.lastEdited}
                                            </p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical size={16}/>
                                        </button>
                                    </div>

                                    {resume.strength && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-foreground/70">Resume Strength</span>
                                                <span className="font-semibold text-[#088395]">{resume.strength}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#088395] rounded-full"
                                                    style={{width: `${resume.strength}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEditResume(resume.id)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16}/>
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors">
                                            <Download size={16}/>
                                        </button>
                                        <button
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors">
                                            <Copy size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">My Cover Letters</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coverLetters.map((letter) => (
                            <div
                                key={letter.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                {/* Preview */}
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

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{letter.name}</h3>
                                            <p className="text-xs text-foreground/50 mt-1">
                                                Updated {letter.lastEdited}
                                            </p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical size={16}/>
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors flex items-center justify-center gap-2">
                                            <Eye size={16}/>
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors">
                                            <Download size={16}/>
                                        </button>
                                        <button
                                            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors">
                                            <Copy size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Recommended Jobs</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <Briefcase size={48} className="text-[#088395] mx-auto mb-4"/>
                        <h3 className="font-semibold mb-2">Unlock Job Recommendations</h3>
                        <p className="text-foreground/70 mb-4">
                            Upgrade to Pro to get personalized job matches based on your resume and location
                        </p>
                        <button
                            onClick={onUpgrade}
                            className="px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
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
