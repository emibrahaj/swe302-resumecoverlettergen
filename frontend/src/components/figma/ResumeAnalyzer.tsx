import {useEffect, useMemo, useState} from 'react';
import {AlertCircle, ArrowLeft, BookOpen, FileText, RefreshCw, Star, Target, TrendingUp, Zap} from 'lucide-react';
import {toast} from 'sonner';
import {RadarChart} from './RadarChart';
import {useUserResumes} from '@/src/hooks/useResume';
import {SKILL_MATRIX_DIMENSIONS, useSkillMatrix} from '@/src/hooks/useSkillMatrix';

interface AnalyzerProps {
    onUpgrade: () => void;
    onBack?: () => void;
}

const MOCK_RADAR = [
    {category: 'Technical Skills', current: 75, target: 90},
    {category: 'Communication', current: 65, target: 85},
    {category: 'Leadership', current: 55, target: 80},
    {category: 'Problem Solving', current: 80, target: 95},
    {category: 'Creativity', current: 70, target: 85},
    {category: 'Collaboration', current: 60, target: 80},
];

export function ResumeAnalyzer({onUpgrade, onBack}: AnalyzerProps) {
    const {resumes: realResumes, loading: resumesLoading} = useUserResumes();
    const [selectedResume, setSelectedResume] = useState<string>('');

    useEffect(() => {
        if (!selectedResume && realResumes.length > 0) setSelectedResume(realResumes[0].id);
    }, [realResumes, selectedResume]);

    const {matrix, loading: matrixLoading, error: matrixError, compute} = useSkillMatrix(selectedResume || null);

    const resumes = realResumes.length > 0
        ? realResumes.map((r) => ({
            id: r.id,
            name: r.target_job_title || 'Untitled resume',
            lastEdited: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'recent',
        }))
        : [
            {id: '1', name: 'Software Engineer Resume', lastEdited: '2 hours ago'},
            {id: '2', name: 'Product Manager CV', lastEdited: '1 day ago'},
            {id: '3', name: 'Frontend Developer', lastEdited: '3 days ago'},
        ];

    const skillRadarData = useMemo(() => {
        if (!matrix) return MOCK_RADAR;
        return SKILL_MATRIX_DIMENSIONS.map(({key, label}) => ({
            category: label,
            current: Number(matrix[key]) || 0,
            target: 90,
        }));
    }, [matrix]);

    const score = matrix?.overall ?? 78;

    const handleAnalyze = async () => {
        if (!selectedResume) {
            toast.error('Pick a resume first');
            return;
        }
        const t = toast.loading('Analyzing resume with AI…');
        const result = await compute();
        toast.dismiss(t);
        if (result) toast.success(`Resume strength: ${result.overall}%`);
        else toast.error(matrixError || 'Failed to analyze');
    };

    const weaknesses = [
        {
            area: 'Work Experience',
            issue: 'Lacks quantifiable achievements',
            suggestion: 'Add specific metrics: "Increased sales by 35%" instead of "Improved sales"',
            severity: 'high'
        },
        {
            area: 'Skills Section',
            issue: 'Missing industry-standard tools',
            suggestion: 'Add relevant technologies like Docker, Kubernetes, AWS to match job requirements',
            severity: 'high'
        },
        {
            area: 'Format & ATS',
            issue: 'Non-standard section headers',
            suggestion: 'Use "Work Experience" instead of "My Journey" for better ATS compatibility',
            severity: 'medium'
        },
        {
            area: 'Projects',
            issue: 'Limited technical depth',
            suggestion: 'Describe the technical challenges solved and technologies used in detail',
            severity: 'medium'
        },
        {
            area: 'Keywords',
            issue: 'Low keyword match rate (45%)',
            suggestion: 'Incorporate more job-specific keywords from target job descriptions',
            severity: 'high'
        }
    ];

    const skillsWithCourses = [
        {
            skill: {
                name: 'Cloud Architecture (AWS/Azure)',
                currentLevel: 40,
                targetLevel: 85,
                priority: 'Critical',
                reason: 'Required in 78% of target job postings'
            },
            course: {
                title: 'AWS Certified Solutions Architect',
                provider: 'AWS Training',
                duration: '20 hours',
                relevance: 98,
                price: 'Free'
            }
        },
        {
            skill: {
                name: 'System Design',
                currentLevel: 55,
                targetLevel: 90,
                priority: 'High',
                reason: 'Essential for senior-level positions'
            },
            course: {
                title: 'System Design Interview Masterclass',
                provider: 'Educative',
                duration: '15 hours',
                relevance: 95,
                price: '$59',
                originalPrice: '$89',
                discount: '15% off'
            }
        },
        {
            skill: {
                name: 'Microservices Architecture',
                currentLevel: 50,
                targetLevel: 80,
                priority: 'High',
                reason: 'Growing demand in your industry'
            },
            course: {
                title: 'Microservices with Node.js and Docker',
                provider: 'Udemy',
                duration: '12 hours',
                relevance: 92,
                price: '$19.99',
                originalPrice: '$34.99',
                discount: '20% off'
            }
        },
        {
            skill: {
                name: 'DevOps & CI/CD',
                currentLevel: 35,
                targetLevel: 75,
                priority: 'Medium',
                reason: 'Valuable complementary skill'
            },
            course: {
                title: 'Complete DevOps & CI/CD Pipeline',
                provider: 'Pluralsight',
                duration: '10 hours',
                relevance: 88,
                price: '$29/month'
            }
        },
        {
            skill: {
                name: 'TypeScript',
                currentLevel: 60,
                targetLevel: 85,
                priority: 'Medium',
                reason: 'Industry standard for modern frontend'
            },
            course: {
                title: 'TypeScript: The Complete Developer Guide',
                provider: 'Frontend Masters',
                duration: '8 hours',
                relevance: 85,
                price: '$39/month',
                originalPrice: '$49/month',
                discount: '10% off'
            }
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-4"
                    >
                        <ArrowLeft size={20}/>
                        Back to Dashboard
                    </button>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <label className="block text-sm font-semibold mb-3">Select Resume to Analyze</label>
                            <div className="relative">
                                <FileText size={18}
                                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                <select
                                    value={selectedResume}
                                    onChange={(e) => setSelectedResume(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent appearance-none bg-white cursor-pointer"
                                >
                                    {resumes.map((resume) => (
                                        <option key={resume.id} value={resume.id}>
                                            {resume.name} (Updated {resume.lastEdited})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#088395] rounded-sm"></div>
                                    <span className="text-foreground/70">Current Level</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-teal-500 rounded-sm"></div>
                                    <span className="text-foreground/70">Target Level</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={matrixLoading || resumesLoading || !selectedResume}
                                className={`mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all ${
                                    matrixLoading ? 'opacity-75 cursor-wait' : ''
                                }`}
                            >
                                <RefreshCw size={16} className={matrixLoading ? 'animate-spin' : ''}/>
                                {matrixLoading ? 'Analyzing…' : matrix ? 'Re-analyze' : 'Analyze Resume'}
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <RadarChart data={skillRadarData}/>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-[#088395] rounded-full flex items-center justify-center">
                            <TrendingUp size={32} className="text-white"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Resume Strength Analysis</h2>
                            <p className="text-foreground/70">AI-powered insights for your resume</p>
                        </div>
                    </div>

                    <div className="relative mb-8">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-foreground/70">Current Score</span>
                            <span className="text-4xl font-bold text-[#088395]">{score}%</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#088395] rounded-full transition-all"
                                style={{width: `${score}%`}}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-foreground/50 mt-1">
                            <span>Poor</span>
                            <span>Good</span>
                            <span>Excellent</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {matrix ? SKILL_MATRIX_DIMENSIONS.filter(d => Number(matrix[d.key]) >= 75).length : 12}
                            </div>
                            <div className="text-sm text-foreground/70">Strong Points</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-3xl font-bold text-yellow-600 mb-1">
                                {matrix ? SKILL_MATRIX_DIMENSIONS.filter(d => Number(matrix[d.key]) >= 40 && Number(matrix[d.key]) < 75).length : 5}
                            </div>
                            <div className="text-sm text-foreground/70">Needs Improvement</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-3xl font-bold text-red-600 mb-1">
                                {matrix ? SKILL_MATRIX_DIMENSIONS.filter(d => Number(matrix[d.key]) < 40).length : 2}
                            </div>
                            <div className="text-sm text-foreground/70">Critical Issues</div>
                        </div>
                    </div>

                    {matrix && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {SKILL_MATRIX_DIMENSIONS.map(({key, label}) => {
                                const dim = matrix.dimensions?.[key] || {score: Number(matrix[key]) || 0, reason: ''};
                                const score = Number(dim.score) || 0;
                                const tone = score >= 75 ? 'border-green-300 bg-green-50' : score >= 40 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50';
                                return (
                                    <div key={String(key)} className={`p-4 rounded-lg border ${tone}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold">{label}</span>
                                            <span className="text-lg font-bold text-[#088395]">{score}</span>
                                        </div>
                                        <p className="text-sm text-foreground/70">{dim.reason || '—'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle size={24} className="text-red-600"/>
                        <h3 className="text-xl font-semibold">Resume Weaknesses</h3>
                    </div>
                    <p className="text-foreground/70 mb-6">
                        AI-identified areas that need improvement to increase your chances of landing interviews
                    </p>
                    <div className="space-y-4">
                        {weaknesses.map((weakness, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-lg border-l-4 ${
                                    weakness.severity === 'high'
                                        ? 'bg-red-50 border-red-500'
                                        : weakness.severity === 'medium'
                                            ? 'bg-yellow-50 border-yellow-500'
                                            : 'bg-blue-50 border-blue-500'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-lg">{weakness.area}</h4>
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                        weakness.severity === 'high'
                                            ? 'bg-red-100 text-red-700'
                                            : weakness.severity === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                    }`}>
                    {weakness.severity === 'high' ? 'Critical' : weakness.severity === 'medium' ? 'Medium' : 'Low'} Priority
                  </span>
                                </div>
                                <p className="text-sm text-foreground/90 mb-2">
                                    <span className="font-semibold">Issue: </span>{weakness.issue}
                                </p>
                                <p className="text-sm text-foreground/70 flex items-start gap-2">
                                    <Zap size={16} className="text-[#088395] flex-shrink-0 mt-0.5"/>
                                    <span><span
                                        className="font-semibold">AI Suggestion: </span>{weakness.suggestion}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <Target size={24} className="text-[#088395]"/>
                        <h3 className="text-xl font-semibold">Skills to Develop & Recommended Courses</h3>
                    </div>
                    <p className="text-foreground/70 mb-6">
                        AI-matched skill gaps with targeted courses to help you reach your career goals
                    </p>
                    <div className="space-y-6">
                        {skillsWithCourses.map((item, index) => (
                            <div key={index}
                                 className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#088395] transition-colors">
                                <div className="grid md:grid-cols-2 gap-0">
                                    {/* Skill Section */}
                                    <div className="p-6 bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target size={18} className="text-[#088395]"/>
                                                    <h4 className="font-semibold text-lg">{item.skill.name}</h4>
                                                </div>
                                                <p className="text-sm text-foreground/70 mb-3">{item.skill.reason}</p>
                                            </div>
                                            <span
                                                className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-2 ${
                                                    item.skill.priority === 'Critical'
                                                        ? 'bg-red-100 text-red-700'
                                                        : item.skill.priority === 'High'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                }`}>
                        {item.skill.priority}
                      </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-foreground/70">Current Level</span>
                                                <span className="font-semibold">{item.skill.currentLevel}%</span>
                                            </div>
                                            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute h-full bg-gray-400 rounded-full"
                                                    style={{width: `${item.skill.currentLevel}%`}}
                                                ></div>
                                                <div
                                                    className="absolute h-full bg-[#088395] rounded-full opacity-40"
                                                    style={{width: `${item.skill.targetLevel}%`}}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-foreground/70">Target Level</span>
                                                <span
                                                    className="font-semibold text-[#088395]">{item.skill.targetLevel}%</span>
                                            </div>
                                            <div
                                                className="text-sm font-semibold text-[#088395] bg-[#088395]/10 rounded-lg px-3 py-2 text-center">
                                                Gap to close: {item.skill.targetLevel - item.skill.currentLevel}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Section */}
                                    <div className="p-6 bg-white border-l-2 border-gray-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BookOpen size={18} className="text-[#088395]"/>
                                            <h4 className="font-semibold">Recommended Course</h4>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h5 className="font-semibold text-lg text-[#088395]">{item.course.title}</h5>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <Star size={16} className="text-yellow-500 fill-yellow-500"/>
                                                    <span
                                                        className="font-semibold text-sm">{item.course.relevance}%</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground/70 mb-3">
                                                {item.course.provider} • {item.course.duration}
                                            </p>
                                            <div className="mb-4">
                                                <div className="text-xs text-foreground/70 mb-1">Course Match Score
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#088395] to-teal-400 rounded-full"
                                                        style={{width: `${item.course.relevance}%`}}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                          <span className="text-sm px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full font-semibold">
                            {item.course.price}
                          </span>
                                                    {item.course.discount && (
                                                        <span
                                                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                              {item.course.discount}
                            </span>
                                                    )}
                                                </div>
                                                {item.course.originalPrice && (
                                                    <span className="text-xs text-foreground/50 line-through">
                            {item.course.originalPrice}
                          </span>
                                                )}
                                            </div>
                                            <button
                                                className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold">
                                                View Course
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
