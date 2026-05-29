"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Building2,
  TrendingUp,
  FileUser,
  Loader2,
  X,
} from "lucide-react";

import { api, ApiError } from "@/src/lib/api";

interface JobPosting {
  id: string;
  job_title: string;
  company_name: string | null;
  job_location: string | null;
  salary: string | null;
  employment_type: string | null;
  description: string | null;
  required_skills: string[];
  created_at: string;
}

interface MatchedJob {
  id: string | null;
  job_id: string;
  match_score: number;
  status: string;
  resume_id: string;
  job_posting: JobPosting;
}

interface MatchResponse {
  resume_id: string;
  matches_saved: number;
  matches: MatchedJob[];
}

interface Resume {
  id: string;
  target_job_title: string | null;
  created_at: string;
  polished_content?: Record<string, unknown> | null;
  raw_content?: Record<string, unknown> | null;
}

interface CoverLetter {
  id: string;
  title: string;
  created_at: string;
}

interface MatchedJobBoardProps {
  onBack: () => void;
  onApply?: (jobId: string) => void;
  onViewApplications?: () => void;
}

function extractSkillNames(
  content: Record<string, unknown> | null | undefined
): string[] {
  if (!content) return [];

  const skills = content.skills;

  if (!Array.isArray(skills)) return [];

  return (skills as unknown[])
    .map((s) => {
      if (typeof s === "string") return s;

      if (s && typeof s === "object") {
        const obj = s as Record<string, unknown>;

        return (obj.skill_name as string) || (obj.name as string) || "";
      }

      return "";
    })
    .filter(Boolean);
}

function getMatchingSkills(
  userSkills: string[],
  requiredSkills: string[]
): string[] {
  const userLower = new Set(userSkills.map((s) => s.toLowerCase()));

  return (requiredSkills ?? []).filter((s) =>
    userLower.has(s.toLowerCase())
  );
}

function getMatchColor(score: number) {
  const pct = Math.round(score * 100);

  if (pct >= 90) return "text-green-600 bg-green-100";

  if (pct >= 70) return "text-[#088395] bg-[#088395]/10";

  return "text-yellow-600 bg-yellow-100";
}

function formatPostedDate(iso: string): string {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86_400_000
  );

  if (days === 0) return "today";

  if (days === 1) return "1 day ago";

  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);

  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export function MatchedJobBoard({
  onBack,
  onApply,
  onViewApplications,
}: MatchedJobBoardProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [matches, setMatches] = useState<MatchedJob[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  const [loadingResumes, setLoadingResumes] = useState(true);
  const [matching, setMatching] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [viewingAll, setViewingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Apply Modal
  const [applyJob, setApplyJob] = useState<MatchedJob | null>(null);

  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  const [applyResumeId, setApplyResumeId] = useState("");

  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState("");

  const [applying, setApplying] = useState(false);

  const [applyError, setApplyError] = useState<string | null>(null);

  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    api
      .get<Resume[]>("/resume/my-resumes")
      .then((data) => {
        setResumes(data);

        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      })
      .catch(() => setError("Failed to load your resumes."))
      .finally(() => setLoadingResumes(false));
  }, []);

  const runMatching = useCallback(
    async (resumeId: string, resume: Resume) => {
      setMatching(true);
      setError(null);

      try {
        const result = await api.post<MatchResponse>(
          `/jobs/match-my-resume/${resumeId}`
        );

        if (!result || typeof result !== "object") {
          throw new Error("Unexpected response from server.");
        }

        const filtered = (result.matches ?? []).filter(
          (m) => m.match_score > 0
        );

        setMatches(filtered);
        setHasRun(true);

        const content = resume.polished_content ?? resume.raw_content;

        setUserSkills(extractSkillNames(content));
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to load job matches.";

        setError(msg);
      } finally {
        setMatching(false);
      }
    },
    []
  );

  const handleFindMatches = () => {
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume || matching) return;
    setViewingAll(false);
    void runMatching(selectedResumeId, resume);
  };

  const handleViewAll = async () => {
    if (matching || resumes.length === 0) return;
    setMatching(true);
    setError(null);
    setMatches([]);
    setHasRun(false);
    setViewingAll(true);

    try {
      const results = await Promise.all(
        resumes.map((r) =>
          api.post<MatchResponse>(`/jobs/match-my-resume/${r.id}`).catch(() => null)
        )
      );

      const bestByJob = new Map<string, MatchedJob>();
      for (const result of results) {
        if (!result) continue;
        for (const m of result.matches ?? []) {
          if (m.match_score <= 0) continue;
          const existing = bestByJob.get(m.job_id);
          if (!existing || m.match_score > existing.match_score) {
            bestByJob.set(m.job_id, m);
          }
        }
      }

      const merged = Array.from(bestByJob.values()).sort(
        (a, b) => b.match_score - a.match_score
      );

      setMatches(merged);
      setHasRun(true);

      const allSkills = new Set<string>();
      for (const r of resumes) {
        extractSkillNames(r.polished_content ?? r.raw_content).forEach((s) =>
          allSkills.add(s)
        );
      }
      setUserSkills(Array.from(allSkills));
    } catch {
      setError("Failed to load matches across all resumes.");
    } finally {
      setMatching(false);
    }
  };

  const openApplyModal = async (job: MatchedJob) => {
    setApplyJob(job);

    setApplyResumeId(selectedResumeId);

    setApplyError(null);

    setApplySuccess(false);

    setSelectedCoverLetterId("");

    try {
      const clData = await api.get<CoverLetter[]>("/cover-letters/");

      setCoverLetters(clData);
    } catch {
      setCoverLetters([]);
    }
  };

  const handleSubmitApplication = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!applyJob) return;

    setApplying(true);

    setApplyError(null);

    try {
      await api.post(`/applications/apply/${applyJob.job_posting.id}`, {
        resume_id: applyResumeId || null,
        cover_letter_id: selectedCoverLetterId || null,
      });

      setApplySuccess(true);

      setMatches((prev) =>
        prev.map((m) =>
          m.job_id === applyJob.job_posting.id
            ? { ...m, status: "applied" }
            : m
        )
      );

      onApply?.(applyJob.job_posting.id);

      setTimeout(() => setApplyJob(null), 1500);
    } catch (err) {
      setApplyError(
        err instanceof ApiError
          ? err.message
          : "Failed to submit application."
      );
    } finally {
      setApplying(false);
    }
  };

  const highMatchCount = matches.filter(
    (m) => Math.round(m.match_score * 100) >= 90
  ).length;

  const goodMatchCount = matches.filter((m) => {
    const pct = Math.round(m.match_score * 100);

    return pct >= 70 && pct < 90;
  }).length;

  const isLoading = loadingResumes || (matching && !hasRun);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-[#088395] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={32} />

                <h1 className="text-3xl font-bold">
                  Matched Jobs for You
                </h1>
              </div>

              <p className="text-cyan-100">
                These jobs are selected based on your resume, skills,
                and experience. Higher match scores indicate better
                compatibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resume selector */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-semibold mb-2">
              Match jobs against:
            </label>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  setMatches([]);
                  setHasRun(false);
                  setViewingAll(false);
                }}
                disabled={matching}
                className="flex-1 min-w-0 max-w-md px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none disabled:opacity-60"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.target_job_title ??
                      `Resume – ${new Date(r.created_at).toLocaleDateString()}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleFindMatches}
                disabled={matching || !selectedResumeId}
                className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {matching && !viewingAll ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Find Matches
                  </>
                )}
              </button>

              {resumes.length > 1 && (
                <button
                  type="button"
                  onClick={handleViewAll}
                  disabled={matching}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg font-semibold hover:bg-[#088395]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {matching && viewingAll ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <Star size={16} />
                      View All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-green-600" />
              </div>

              <div>
                <p className="text-foreground/70 text-sm">
                  High Match (90%+)
                </p>

                <p className="text-2xl font-bold">
                  {highMatchCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                <TrendingUp
                  size={24}
                  className="text-[#088395]"
                />
              </div>

              <div>
                <p className="text-foreground/70 text-sm">
                  Good Match (70-89%)
                </p>

                <p className="text-2xl font-bold">
                  {goodMatchCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Briefcase
                  size={24}
                  className="text-yellow-600"
                />
              </div>

              <div>
                <p className="text-foreground/70 text-sm">
                  Total Matches
                </p>

                <p className="text-2xl font-bold">
                  {matches.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* APPLICATIONS CARD */}
        <div className="relative bg-gradient-to-br mb-8 from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#088395]/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />

          <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#088395]/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <FileUser
                size={22}
                className="text-[#088395]"
              />

              <h3 className="text-xl font-bold">
                Your Applications
              </h3>
            </div>

            <p className="text-white/60 text-xs mb-4">
              See all the jobs you have applied to.
            </p>
          </div>

          <button
            onClick={onViewApplications}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all mt-4"
          >
            <Briefcase size={16} />
            View My Applications
          </button>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-foreground/60">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />

            {loadingResumes
              ? "Loading your resumes…"
              : "Analyzing your resume against job listings…"}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-600">
            {error}
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase
              size={48}
              className="text-foreground/30 mx-auto mb-4"
            />

            <h3 className="font-semibold mb-2">
              No Resume Found
            </h3>

            <p className="text-foreground/70 mb-4">
              Create a resume first to see matched jobs.
            </p>
          </div>
        ) : !hasRun ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-foreground/60">
            <TrendingUp size={48} className="text-foreground/20 mx-auto mb-4" />
            <p>Select a resume above and click <strong>Find Matches</strong> to see job recommendations.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-foreground/60">
            No job matches found for this resume. Check back when new jobs are
            posted.
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {viewingAll
                ? `Best Matches Across All Resumes (${matches.length})`
                : `Recommended Jobs (${matches.length})`}
            </h2>

            <div className="space-y-4">
              {matches.map((match) => {
                const job = match.job_posting;

                const scorePct = Math.round(
                  match.match_score * 100
                );

                const matchingSkills = getMatchingSkills(
                  userSkills,
                  job.required_skills ?? []
                );

                const isExpanded =
                  expandedJobId === match.job_id;

                const isApplied =
                  match.status === "applied";

                return (
                  <div
                    key={match.id ?? match.job_id}
                    className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-[#088395] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold">
                            {job.job_title}
                          </h3>

                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-full ${getMatchColor(
                              match.match_score
                            )}`}
                          >
                            <Star
                              size={14}
                              className="fill-current"
                            />

                            <span className="text-sm font-semibold">
                              {scorePct}% Match
                            </span>
                          </div>

                          {isApplied && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              Applied
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 text-foreground/70">
                            <Building2 size={16} />

                            <span className="font-medium">
                              {job.company_name ??
                                "Unknown Company"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-3">
                          {job.job_location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              {job.job_location}
                            </div>
                          )}

                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {job.salary}
                            </div>
                          )}

                          {job.employment_type && (
                            <div className="flex items-center gap-1">
                              <Briefcase size={14} />

                              {job.employment_type
                                .charAt(0)
                                .toUpperCase() +
                                job.employment_type.slice(1)}
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            Posted{" "}
                            {formatPostedDate(
                              job.created_at
                            )}
                          </div>
                        </div>

                        {job.description && (
                          <p className="text-foreground/80 text-sm mb-4">
                            {job.description}
                          </p>
                        )}

                        {matchingSkills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-foreground/70 mb-2">
                              Your Matching Skills:
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              {matchingSkills.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {isExpanded &&
                          (job.required_skills ?? []).length >
                            0 && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="text-sm font-semibold mb-2">
                                All Required Skills:
                              </h4>

                              <div className="flex flex-wrap gap-2">
                                {job.required_skills.map(
                                  (skill, i) => {
                                    const matched =
                                      userSkills
                                        .map((s) =>
                                          s.toLowerCase()
                                        )
                                        .includes(
                                          skill.toLowerCase()
                                        );

                                    return (
                                      <span
                                        key={i}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                          matched
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {skill}
                                      </span>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {isApplied ? (
                        <button
                          disabled
                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                        >
                          <Briefcase size={16} />
                          Already Applied
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            openApplyModal(match)
                          }
                          className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          <Briefcase size={16} />
                          Apply Now
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setExpandedJobId(
                            isExpanded
                              ? null
                              : match.job_id
                          )
                        }
                        className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"
                      >
                        {isExpanded
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* APPLY MODAL */}
      {applyJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setApplyJob(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-2">
              Apply for {applyJob.job_posting.job_title}
            </h2>

            <p className="text-foreground/70 mb-6">
              at{" "}
              {applyJob.job_posting.company_name ??
                "Unknown Company"}
            </p>

            <form
              onSubmit={handleSubmitApplication}
              className="space-y-6"
            >
              {applyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {applyError}
                </div>
              )}

              {applySuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  Application submitted successfully!
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Resume{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  value={applyResumeId}
                  onChange={(e) =>
                    setApplyResumeId(e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.target_job_title ??
                        `Resume – ${new Date(
                          r.created_at
                        ).toLocaleDateString()}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Cover Letter{" "}
                  <span className="text-foreground/40 font-normal">
                    (optional)
                  </span>
                </label>

                <select
                  value={selectedCoverLetterId}
                  onChange={(e) =>
                    setSelectedCoverLetterId(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                >
                  <option value="">None</option>

                  {coverLetters.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={applying || applySuccess}
                  className="flex-1 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying
                    ? "Submitting…"
                    : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => setApplyJob(null)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}