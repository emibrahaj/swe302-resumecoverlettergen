"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Crown,
    ExternalLink,
    FileText,
    Loader2,
    RefreshCw,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import { RadarChart } from "./RadarChart";
import { useUserResumes } from "@/src/hooks/useResume";
import {
    SKILL_MATRIX_DIMENSIONS,
    useSkillMatrix,
    type CourseRecommendation,
    type SkillMatrix,
} from "@/src/hooks/useSkillMatrix";
import { useSubscription } from "@/src/context/SubscriptionContext";

interface AnalyzerProps {
    onUpgrade: () => void;
    onBack?: () => void;
}

const TARGET = 90;

interface DerivedWeakness {
    area: string;
    issue: string;
    suggestion: string;
    severity: "high" | "medium" | "low";
    score: number;
}

const DIMENSION_LABELS: Record<string, string> = Object.fromEntries(
    SKILL_MATRIX_DIMENSIONS.map(({ key, label }) => [String(key), label]),
);

// Heuristic suggestions per dimension when the user's score lags. The wording
// is generic by design — the matrix's own `reason` text already gives the
// specific diagnosis (e.g. "2 of 8 bullets contain a measurable outcome").
const SUGGESTIONS: Record<string, string> = {
    experience:
        "Add more roles, expand each description to at least 50 words, and weave in measurable outcomes (numbers, %, $).",
    education:
        "List your highest qualification with the degree name spelled out (Bachelor, Master, MSc, etc.) and add any relevant coursework.",
    technical_skills:
        "Add the specific tools and technologies the target role requires — naming them explicitly helps both the AI and ATS systems.",
    soft_skills:
        "Show leadership, collaboration, and problem-solving through verbs in your bullets (led, coordinated, debugged, mentored).",
    achievements:
        "Quantify outcomes: replace 'improved performance' with 'cut p95 latency 35%' or 'saved €12k/year'.",
    keywords:
        "Pull the exact phrasing from the target job posting into your skills and bullets — synonyms don't match keyword filters.",
    formatting:
        "Make sure the resume has full name + email/phone, an experience section, an education section, and a clear job title.",
    job_relevance:
        "Re-anchor your summary and top bullet at each role to the target job title so a recruiter sees the fit in 6 seconds.",
};

function severityFor(score: number): "high" | "medium" | "low" {
    if (score < 40) return "high";
    if (score < 70) return "medium";
    return "low";
}

function deriveWeaknesses(matrix: SkillMatrix): DerivedWeakness[] {
    return SKILL_MATRIX_DIMENSIONS
        .map(({ key }) => {
            const k = String(key);
            const dim = matrix.dimensions?.[k] || {
                score: Number(matrix[key as keyof SkillMatrix]) || 0,
                reason: "",
            };
            return {
                area: DIMENSION_LABELS[k] ?? k,
                issue: dim.reason || "No detail available.",
                suggestion: SUGGESTIONS[k] ?? "Strengthen this section to lift your overall score.",
                severity: severityFor(dim.score),
                score: dim.score,
            };
        })
        .filter((w) => w.score < 75)
        .sort((a, b) => a.score - b.score);
}

function priorityFromScore(score: number): "Critical" | "High" | "Medium" {
    if (score < 40) return "Critical";
    if (score < 70) return "High";
    return "Medium";
}

interface SkillCard {
    skill: {
        name: string;
        currentLevel: number;
        targetLevel: number;
        priority: "Critical" | "High" | "Medium";
        reason: string;
    };
    course: CourseRecommendation | null;
}

function buildSkillCards(matrix: SkillMatrix): SkillCard[] {
    const missing = (matrix.missing_skills || []).slice(0, 6);
    const courses = matrix.recommended_courses || [];
    const keywordScore = Number(matrix.keywords) || 0;
    const currentLevel = Math.max(20, Math.min(60, keywordScore));
    return missing.map((skill, i) => {
        const lower = skill.trim().toLowerCase();
        const match =
            courses.find((c) => {
                const cat = (c.skill_category || "").toLowerCase();
                const title = (c.title || "").toLowerCase();
                return cat === lower || title.includes(lower) || lower.includes(cat);
            }) || courses[i] || null;
        return {
            skill: {
                name: skill,
                currentLevel,
                targetLevel: TARGET,
                priority: priorityFromScore(keywordScore),
                reason: matrix.target_job_title
                    ? `Listed in market data for ${matrix.target_job_title}`
                    : "Common requirement for your target role",
            },
            course: match,
        };
    });
}

function UpgradeGate({ onUpgrade }: { onUpgrade: () => void }) {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-4">
                    <Crown size={28} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Resume Analyzer is a Pro feature</h1>
                <p className="text-foreground/70 mb-6 max-w-md mx-auto">
                    Score your resume across 8 dimensions — experience, skills, keywords,
                    achievements, formatting, and more — and get AI-matched courses to close
                    the gaps.
                </p>
                <button
                    onClick={onUpgrade}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                    <Crown size={14} className="text-yellow-300" />
                    Upgrade — from €3.99/week
                </button>
            </div>
        </div>
    );
}

export function ResumeAnalyzer({ onUpgrade, onBack }: AnalyzerProps) {
    const { isPro, loading: subLoading } = useSubscription();
    const { resumes, loading: resumesLoading } = useUserResumes();
    const [selectedResume, setSelectedResume] = useState<string>("");

    useEffect(() => {
        if (!selectedResume && resumes.length > 0) setSelectedResume(resumes[0].id);
    }, [resumes, selectedResume]);

    const {
        matrix,
        loading: matrixLoading,
        error: matrixError,
        compute,
    } = useSkillMatrix(selectedResume || null);

    const skillRadarData = useMemo(() => {
        if (!matrix) return [];
        return SKILL_MATRIX_DIMENSIONS.map(({ key, label }) => ({
            category: label,
            current: Number(matrix[key]) || 0,
            target: TARGET,
        }));
    }, [matrix]);

    const weaknesses = useMemo(() => (matrix ? deriveWeaknesses(matrix) : []), [matrix]);
    const skillCards = useMemo(() => (matrix ? buildSkillCards(matrix) : []), [matrix]);

    const strongCount = matrix
        ? SKILL_MATRIX_DIMENSIONS.filter((d) => Number(matrix[d.key]) >= 75).length
        : 0;
    const needsImprovementCount = matrix
        ? SKILL_MATRIX_DIMENSIONS.filter(
              (d) => Number(matrix[d.key]) >= 40 && Number(matrix[d.key]) < 75,
          ).length
        : 0;
    const criticalCount = matrix
        ? SKILL_MATRIX_DIMENSIONS.filter((d) => Number(matrix[d.key]) < 40).length
        : 0;

    const handleAnalyze = async () => {
        if (!selectedResume) {
            toast.error("Pick a resume first");
            return;
        }
        const t = toast.loading("Analyzing resume with AI…");
        const result = await compute();
        toast.dismiss(t);
        if (result) toast.success(`Resume strength: ${result.overall}%`);
        else toast.error(matrixError || "Failed to analyze");
    };

    // Don't render anything while we still don't know the user's tier — avoids
    // a flash of the Pro UI for a free user (or vice versa).
    if (subLoading) return null;
    if (!isPro) return <UpgradeGate onUpgrade={onUpgrade} />;

    const score = matrix?.overall ?? null;
    const hasMatrix = matrix !== null;
    const noResumes = !resumesLoading && resumes.length === 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                )}

                {noResumes ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-[#088395]/10 flex items-center justify-center mb-3">
                            <FileText size={22} className="text-[#088395]" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No resumes yet</h2>
                        <p className="text-foreground/70 mb-5">
                            Save a resume first, then come back here to score it across 8 dimensions.
                        </p>
                        <a
                            href="/create/resume"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            <Sparkles size={16} />
                            Create a resume
                        </a>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <label className="block text-sm font-semibold mb-3">
                                    Select Resume to Analyze
                                </label>
                                <div className="relative">
                                    <FileText
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                    <select
                                        value={selectedResume}
                                        onChange={(e) => setSelectedResume(e.target.value)}
                                        disabled={resumesLoading || resumes.length === 0}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent appearance-none bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resumes.map((resume) => (
                                            <option key={resume.id} value={resume.id}>
                                                {resume.target_job_title || "Untitled resume"}
                                                {resume.created_at
                                                    ? ` (saved ${new Date(resume.created_at).toLocaleDateString()})`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg
                                            className="w-5 h-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
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
                                    className={`mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                        matrixLoading ? "cursor-wait" : ""
                                    }`}
                                >
                                    <RefreshCw size={16} className={matrixLoading ? "animate-spin" : ""} />
                                    {matrixLoading
                                        ? "Analyzing…"
                                        : hasMatrix
                                          ? "Re-analyze"
                                          : "Analyze Resume"}
                                </button>
                                {matrixError && (
                                    <p className="mt-3 text-sm text-red-600">{matrixError}</p>
                                )}
                            </div>
                            <div className="flex justify-center">
                                {skillRadarData.length > 0 ? (
                                    <RadarChart data={skillRadarData} />
                                ) : (
                                    <div className="text-center text-foreground/50 text-sm max-w-[260px]">
                                        Run an analysis to see your 8-dimension matrix here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state — nothing scored yet */}
                {!hasMatrix && !matrixLoading && !noResumes && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-[#088395]/10 flex items-center justify-center mb-3">
                            <Sparkles size={22} className="text-[#088395]" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Ready when you are</h2>
                        <p className="text-foreground/70 max-w-md mx-auto">
                            Click <strong>Analyze Resume</strong> above to score this resume across
                            the 8 dimensions and unlock weakness diagnostics + course
                            recommendations.
                        </p>
                    </div>
                )}

                {matrixLoading && !hasMatrix && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex items-center justify-center gap-3 text-foreground/70">
                        <Loader2 size={20} className="animate-spin text-[#088395]" />
                        Scoring your resume…
                    </div>
                )}

                {hasMatrix && (
                    <>
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-[#088395] rounded-full flex items-center justify-center">
                                    <TrendingUp size={32} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Resume Strength Analysis</h2>
                                    <p className="text-foreground/70">
                                        AI-powered insights for your resume
                                        {matrix?.target_job_title ? (
                                            <> — target: <strong>{matrix.target_job_title}</strong></>
                                        ) : null}
                                    </p>
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
                                        style={{ width: `${score}%` }}
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
                                        {strongCount}
                                    </div>
                                    <div className="text-sm text-foreground/70">Strong Points</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                                        {needsImprovementCount}
                                    </div>
                                    <div className="text-sm text-foreground/70">Needs Improvement</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-3xl font-bold text-red-600 mb-1">
                                        {criticalCount}
                                    </div>
                                    <div className="text-sm text-foreground/70">Critical Issues</div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {SKILL_MATRIX_DIMENSIONS.map(({ key, label }) => {
                                    const dim = matrix!.dimensions?.[String(key)] || {
                                        score: Number(matrix![key]) || 0,
                                        reason: "",
                                    };
                                    const dimScore = Number(dim.score) || 0;
                                    const tone =
                                        dimScore >= 75
                                            ? "border-green-300 bg-green-50"
                                            : dimScore >= 40
                                              ? "border-yellow-300 bg-yellow-50"
                                              : "border-red-300 bg-red-50";
                                    return (
                                        <div key={String(key)} className={`p-4 rounded-lg border ${tone}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold">{label}</span>
                                                <span className="text-lg font-bold text-[#088395]">
                                                    {dimScore}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/70">
                                                {dim.reason || "—"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <AlertCircle size={24} className="text-red-600" />
                                <h3 className="text-xl font-semibold">Resume Weaknesses</h3>
                            </div>
                            {weaknesses.length === 0 ? (
                                <p className="text-foreground/70">
                                    No weaknesses detected — every dimension scored 75 or higher. Great job.
                                </p>
                            ) : (
                                <>
                                    <p className="text-foreground/70 mb-6">
                                        AI-identified areas that need improvement to increase your chances of
                                        landing interviews.
                                    </p>
                                    <div className="space-y-4">
                                        {weaknesses.map((weakness, index) => (
                                            <div
                                                key={index}
                                                className={`p-5 rounded-lg border-l-4 ${
                                                    weakness.severity === "high"
                                                        ? "bg-red-50 border-red-500"
                                                        : weakness.severity === "medium"
                                                          ? "bg-yellow-50 border-yellow-500"
                                                          : "bg-blue-50 border-blue-500"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2 gap-3">
                                                    <h4 className="font-semibold text-lg">{weakness.area}</h4>
                                                    <span
                                                        className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                                                            weakness.severity === "high"
                                                                ? "bg-red-100 text-red-700"
                                                                : weakness.severity === "medium"
                                                                  ? "bg-yellow-100 text-yellow-700"
                                                                  : "bg-blue-100 text-blue-700"
                                                        }`}
                                                    >
                                                        Score {weakness.score} •{" "}
                                                        {weakness.severity === "high"
                                                            ? "Critical"
                                                            : weakness.severity === "medium"
                                                              ? "Medium"
                                                              : "Low"}{" "}
                                                        Priority
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/90 mb-2">
                                                    <span className="font-semibold">Issue: </span>
                                                    {weakness.issue}
                                                </p>
                                                <p className="text-sm text-foreground/70 flex items-start gap-2">
                                                    <Zap
                                                        size={16}
                                                        className="text-[#088395] flex-shrink-0 mt-0.5"
                                                    />
                                                    <span>
                                                        <span className="font-semibold">
                                                            AI Suggestion:{" "}
                                                        </span>
                                                        {weakness.suggestion}
                                                    </span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <Target size={24} className="text-[#088395]" />
                                <h3 className="text-xl font-semibold">
                                    Skills to Develop & Recommended Courses
                                </h3>
                            </div>
                            {skillCards.length === 0 ? (
                                <p className="text-foreground/70">
                                    No skill gaps detected against the market data for your target role.
                                    {matrix?.target_job_title ? null : (
                                        <>
                                            {" "}
                                            Add a target job title to your resume to unlock keyword-based
                                            recommendations.
                                        </>
                                    )}
                                </p>
                            ) : (
                                <>
                                    <p className="text-foreground/70 mb-6">
                                        AI-matched skill gaps with targeted courses to help you reach your
                                        career goals.
                                    </p>
                                    <div className="space-y-6">
                                        {skillCards.map((item, index) => {
                                            const course = item.course;
                                            return (
                                                <div
                                                    key={index}
                                                    className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#088395] transition-colors"
                                                >
                                                    <div className="grid md:grid-cols-2 gap-0">
                                                        <div className="p-6 bg-gray-50">
                                                            <div className="flex items-start justify-between mb-3 gap-3">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Target
                                                                            size={18}
                                                                            className="text-[#088395]"
                                                                        />
                                                                        <h4 className="font-semibold text-lg">
                                                                            {item.skill.name}
                                                                        </h4>
                                                                    </div>
                                                                    <p className="text-sm text-foreground/70 mb-3">
                                                                        {item.skill.reason}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                                                                        item.skill.priority === "Critical"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : item.skill.priority === "High"
                                                                              ? "bg-orange-100 text-orange-700"
                                                                              : "bg-blue-100 text-blue-700"
                                                                    }`}
                                                                >
                                                                    {item.skill.priority}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-foreground/70">
                                                                        Current Level
                                                                    </span>
                                                                    <span className="font-semibold">
                                                                        {item.skill.currentLevel}%
                                                                    </span>
                                                                </div>
                                                                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="absolute h-full bg-gray-400 rounded-full"
                                                                        style={{ width: `${item.skill.currentLevel}%` }}
                                                                    ></div>
                                                                    <div
                                                                        className="absolute h-full bg-[#088395] rounded-full opacity-40"
                                                                        style={{ width: `${item.skill.targetLevel}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-foreground/70">
                                                                        Target Level
                                                                    </span>
                                                                    <span className="font-semibold text-[#088395]">
                                                                        {item.skill.targetLevel}%
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-semibold text-[#088395] bg-[#088395]/10 rounded-lg px-3 py-2 text-center">
                                                                    Gap to close:{" "}
                                                                    {item.skill.targetLevel -
                                                                        item.skill.currentLevel}
                                                                    %
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-6 bg-white border-l-2 border-gray-200">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <BookOpen
                                                                    size={18}
                                                                    className="text-[#088395]"
                                                                />
                                                                <h4 className="font-semibold">
                                                                    Recommended Course
                                                                </h4>
                                                            </div>
                                                            {course ? (
                                                                <>
                                                                    <div className="mb-4">
                                                                        <div className="flex items-start justify-between mb-2 gap-3">
                                                                            <h5 className="font-semibold text-lg text-[#088395]">
                                                                                {course.title || "Recommended course"}
                                                                            </h5>
                                                                            {typeof course.relevance ===
                                                                                "number" && (
                                                                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                                                                    <Star
                                                                                        size={16}
                                                                                        className="text-yellow-500 fill-yellow-500"
                                                                                    />
                                                                                    <span className="font-semibold text-sm">
                                                                                        {course.relevance}%
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-foreground/70 mb-3">
                                                                            {[course.provider, course.duration]
                                                                                .filter(Boolean)
                                                                                .join(" • ") || "—"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-sm px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full font-semibold w-fit">
                                                                                {course.price || "Free"}
                                                                            </span>
                                                                        </div>
                                                                        {course.url ? (
                                                                            <a
                                                                                href={course.url}
                                                                                target="_blank"
                                                                                rel="noreferrer noopener"
                                                                                className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold inline-flex items-center gap-1.5"
                                                                            >
                                                                                View Course
                                                                                <ExternalLink size={14} />
                                                                            </a>
                                                                        ) : (
                                                                            <a
                                                                                href="/courses"
                                                                                className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                                                                            >
                                                                                Browse Courses
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-sm text-foreground/70">
                                                                    No course matched yet — search the catalog
                                                                    for <strong>{item.skill.name}</strong>.
                                                                    <a
                                                                        href={`/courses?q=${encodeURIComponent(item.skill.name)}`}
                                                                        className="block mt-3 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold text-center"
                                                                    >
                                                                        Browse courses
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
