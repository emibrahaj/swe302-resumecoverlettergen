"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Save,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/src/lib/api";
import { ResumePreview, CVData } from "@/src/components/figma/ResumePreview";


interface CandidateProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  tier?: string | null;
}

interface CandidateResume {
  id: string;
  target_job_title?: string | null;
  raw_content?: Record<string, unknown> | null;
  polished_content?: Record<string, unknown> | null;
}

interface CandidateCoverLetter {
  id: string;
  title?: string | null;
  content?: string | null;
  job_position?: string | null;
}

interface CandidateMatch {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  status: "matched" | "applied" | "accepted" | "declined" | "invited" | string;
  created_at?: string;
  candidate_profile?: CandidateProfile | null;
  resume?: CandidateResume | null;
  cover_letter?: CandidateCoverLetter | null;
}

interface CompanyJob {
  id: string;
  company_id: string;
  company_name?: string | null;
  job_title: string;
  required_skills: string[];
  salary?: string | null;
  job_location?: string | null;
  employment_type?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  applicants_count?: number;
  best_matches_count?: number;
  positions_filled_count?: number;
}

interface DashboardStats {
  active_jobs: number;
  total_applicants: number;
  best_matches: number;
  positions_filled: number;
}

interface DashboardResponse {
  company?: { id: string; company_name: string; is_verified: boolean };
  stats: DashboardStats;
  jobs: CompanyJob[];
}

interface CompanyPortalProps {
  onBack?: () => void;
}

interface JobFormData {
  job_title: string;
  job_location: string;
  employment_type: string;
  salary: string;
  description: string;
  required_skills: string;
  is_active: boolean;
}

const emptyStats: DashboardStats = {
  active_jobs: 0,
  total_applicants: 0,
  best_matches: 0,
  positions_filled: 0,
};

const emptyForm: JobFormData = {
  job_title: "",
  job_location: "",
  employment_type: "full-time",
  salary: "",
  description: "",
  required_skills: "",
  is_active: true,
};

function rawContentToCVData(content: Record<string, unknown>): CVData {
  const skills = Array.isArray(content.skills)
    ? (content.skills as Record<string, unknown>[]).map((s) =>
        typeof s === "string" ? s : String(s?.skill_name ?? "")
      ).filter(Boolean)
    : [];

  const experiences = Array.isArray(content.experiences)
    ? (content.experiences as Record<string, unknown>[]).map((e) => ({
        id: String(e.id ?? Math.random()),
        title: String(e.role ?? e.job_title ?? e.title ?? ""),
        company: String(e.company_name ?? e.company ?? ""),
        location: String(e.location ?? ""),
        startDate: String(e.start_date ?? ""),
        endDate: String(e.end_date ?? ""),
        description: Array.isArray(e.bullets) && (e.bullets as string[]).length > 0
          ? (e.bullets as string[]).join("\n")
          : String(e.description ?? ""),
      }))
    : [];

  const education = Array.isArray(content.education)
    ? (content.education as Record<string, unknown>[]).map((e) => ({
        id: String(e.id ?? Math.random()),
        degree: String(e.degree ?? ""),
        school: String(e.university ?? e.institution ?? e.school ?? ""),
        year: String(e.end_date ?? e.end_year ?? e.year ?? ""),
      }))
    : [];

  const projects = Array.isArray(content.projects)
    ? (content.projects as Record<string, unknown>[]).map((p) => ({
        id: String(p.id ?? Math.random()),
        name: String(p.project_name ?? p.name ?? ""),
        startDate: String(p.start_date ?? ""),
        endDate: String(p.end_date ?? ""),
        description: String(p.description ?? ""),
      }))
    : [];

  const design = (content._design as Record<string, unknown>) ?? {};

  return {
    personalInfo: {
      fullName: String(content.full_name ?? ""),
      email: String(content.email ?? ""),
      phone: String(content.phone ?? ""),
      location: String(content.address ?? ""),
      title: String(content.target_job_title ?? ""),
      summary: String(content.about ?? ""),
    },
    cvPhoto: (content.photo_url as string) ?? null,
    workExperience: experiences,
    education,
    skills,
    projects,
    customSections: [],
    sectionOrder: Array.isArray(design.section_order) ? (design.section_order as string[]) : [],
    accentColor: String(design.accent_color ?? "#088395"),
    fontFamily: String(design.font_family ?? "Inter"),
  };
}

function formatDate(value?: string) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function labelize(value?: string | null) {
  if (!value) return "Not specified";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function skillsToText(skills?: string[]) {
  return (skills ?? []).join(", ");
}

function textToSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function getCandidateName(match: CandidateMatch, index: number) {
  return match.candidate_profile?.full_name || `Candidate #${index + 1}`;
}

export function CompanyPortal({ onBack }: CompanyPortalProps) {
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<CompanyJob | null>(null);
  const [selectedJob, setSelectedJob] = useState<CompanyJob | null>(null);
  const [candidateJob, setCandidateJob] = useState<CompanyJob | null>(null);
  const [candidateMode, setCandidateMode] = useState<"applicants" | "matches">("applicants");
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<CandidateResume | null>(null);
  const [previewCoverLetter, setPreviewCoverLetter] = useState<CandidateCoverLetter | null>(null);
  const [formData, setFormData] = useState<JobFormData>(emptyForm);

  const companyName = useMemo(() => jobs[0]?.company_name || "Company Portal", [jobs]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.get<DashboardResponse>("/company/dashboard");
      setStats(data.stats ?? emptyStats);
      setJobs(data.jobs ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load company dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const resetForm = () => {
    setEditingJob(null);
    setFormData(emptyForm);
  };

  const openCreateForm = () => {
    resetForm();
    setShowNewJobForm(true);
  };

  const handleEditJob = (job: CompanyJob) => {
    setEditingJob(job);
    setFormData({
      job_title: job.job_title ?? "",
      job_location: job.job_location ?? "",
      employment_type: job.employment_type ?? "full-time",
      salary: job.salary ?? "",
      description: job.description ?? "",
      required_skills: skillsToText(job.required_skills),
      is_active: Boolean(job.is_active),
    });
    setShowNewJobForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    try {
      await api.delete(`/company/jobs/${id}`);
      toast.success("Job deleted");
      await loadDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete job");
    }
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      job_title: formData.job_title.trim(),
      job_location: formData.job_location.trim() || null,
      employment_type: formData.employment_type.trim() || null,
      salary: formData.salary.trim() || null,
      description: formData.description.trim() || null,
      required_skills: textToSkills(formData.required_skills),
      is_active: formData.is_active,
    };

    try {
      if (editingJob) {
        await api.patch(`/company/jobs/${editingJob.id}`, payload);
        toast.success("Job updated");
      } else {
        await api.post("/company/jobs/", payload);
        toast.success("Job posted");
      }
      setShowNewJobForm(false);
      resetForm();
      await loadDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const openCandidates = async (job: CompanyJob, mode: "applicants" | "matches") => {
    setCandidateJob(job);
    setCandidateMode(mode);
    setCandidates([]);
    setCandidateError(null);
    setLoadingCandidates(true);
    try {
      const path = mode === "applicants"
        ? `/company/jobs/${job.id}/applicants`
        : `/company/jobs/${job.id}/best-matches`;
      const data = await api.get<CandidateMatch[]>(path);
      setCandidates(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load candidates";
      setCandidateError(msg);
      toast.error(msg);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const updateCandidateStatus = async (matchId: string, status: "accepted" | "declined" | "invited") => {
    if (!candidateJob) return;
    try {
      await api.patch(`/company/jobs/${candidateJob.id}/applicants/${matchId}/status`, { status });
      toast.success(`Candidate ${status}`);
      await openCandidates(candidateJob, candidateMode);
      await loadDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update candidate");
    }
  };

  const inviteCandidate = async (candidate: CandidateMatch) => {
    if (!candidateJob) return;
    try {
      await api.post(`/company/jobs/${candidateJob.id}/invite`, {
        user_id: candidate.user_id,
        resume_id: candidate.resume?.id ?? null,
        match_score: candidate.match_score,
      });
      toast.success("Invitation sent");
      await openCandidates(candidateJob, candidateMode);
      await loadDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/60">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading company dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#088395] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
              <ArrowLeft size={20} /> Back to Home
            </button>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 size={32} />
                <h1 className="text-3xl font-bold">{companyName}</h1>
              </div>
              <p className="text-cyan-100">Manage detailed job postings, applicants, and candidate matches.</p>
            </div>
            <button
              onClick={openCreateForm}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              <Plus size={20} /> Post New Job
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Briefcase size={24} className="text-[#088395]" />} label="Active Jobs" value={stats.active_jobs} />
          <StatCard icon={<Users size={24} className="text-pink-600" />} label="Total Applicants" value={stats.total_applicants} />
          <StatCard icon={<Eye size={24} className="text-[#088395]" />} label="Best Matches" value={stats.best_matches} />
          <StatCard icon={<Building2 size={24} className="text-pink-600" />} label="Positions Filled" value={stats.positions_filled} />
        </div>

        {showNewJobForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingJob ? "Edit Job" : "Post New Job"}</h2>
              <button
                onClick={() => {
                  setShowNewJobForm(false);
                  resetForm();
                }}
                className="text-foreground/70 hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Job Title">
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </Field>

                <Field label="Job Location">
                  <input
                    type="text"
                    placeholder="e.g. Tirana, Albania or Remote"
                    value={formData.job_location}
                    onChange={(e) => setFormData({ ...formData, job_location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Field label="Employment Type">
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </Field>

                <Field label="Salary Range">
                  <input
                    type="text"
                    placeholder="e.g. €900 - €1300 / month"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={formData.is_active ? "active" : "closed"}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </Field>
              </div>

              <Field label="Job Description">
                <textarea
                  rows={8}
                  placeholder="Describe the role, responsibilities, requirements, benefits, and hiring expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                />
              </Field>

              <Field label="Required Skills">
                <input
                  type="text"
                  placeholder="React, TypeScript, SQL, FastAPI"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </Field>

              <div className="flex gap-4">
                <button
                  disabled={saving}
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving…" : editingJob ? "Save Changes" : "Post Job"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewJobForm(false);
                    resetForm();
                  }}
                  className="px-8 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">Your Job Postings</h2>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-foreground/60">
              No job postings yet. Create your first posting with “Post New Job”.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.job_title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${job.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {job.is_active ? "Active" : "Closed"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                        <Info icon={<MapPin size={16} />} text={job.job_location || "Location not specified"} />
                        <Info icon={<Briefcase size={16} />} text={labelize(job.employment_type)} />
                        <Info icon={<DollarSign size={16} />} text={job.salary || "Salary not specified"} />
                        <Info icon={<Clock size={16} />} text={`Posted ${formatDate(job.created_at)}`} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleEditJob(job)} className="p-2 hover:bg-[#088395]/5 rounded-lg text-[#088395]" aria-label="Edit job">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteJob(job.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" aria-label="Delete job">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {job.description && <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{job.description}</p>}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.required_skills ?? []).length > 0 ? (
                      job.required_skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-foreground/50">No skills listed</span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <MiniStat icon={<Users size={22} className="text-[#088395]" />} label="Applicants" value={job.applicants_count ?? 0} />
                    <MiniStat icon={<Star size={22} className="text-pink-600" />} label="Best Matches" value={job.best_matches_count ?? 0} />
                    <button
                      onClick={() => openCandidates(job, "applicants")}
                      className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      View Applicants
                    </button>
                    <button
                      onClick={() => openCandidates(job, "matches")}
                      className="px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg font-semibold hover:bg-[#088395]/5 transition-all"
                    >
                      View Best Matches
                    </button>
                  </div>

                  <button onClick={() => setSelectedJob(job)} className="mt-4 text-sm font-semibold text-[#088395] hover:underline">
                    View full job details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      {previewResume && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Resume Preview</h2>
                {previewResume.target_job_title && (
                  <p className="text-sm text-foreground/60">{previewResume.target_job_title}</p>
                )}
              </div>
              <button onClick={() => setPreviewResume(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {(() => {
                const content = previewResume.polished_content ?? previewResume.raw_content;
                if (!content) return (
                  <p className="text-center text-foreground/50 py-12">No resume content available.</p>
                );
                const cvData = rawContentToCVData(content);
                const templateKey = (content._design as Record<string, unknown> | undefined)?.templateKey as string | undefined;
                return (
                  <div className="transform origin-top scale-[0.85] w-[117%] -ml-[8.5%]">
                    <ResumePreview templateId={templateKey ?? "template7"} data={cvData} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {previewCoverLetter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">{previewCoverLetter.title ?? "Cover Letter"}</h2>
                {previewCoverLetter.job_position && (
                  <p className="text-sm text-foreground/60">For: {previewCoverLetter.job_position}</p>
                )}
              </div>
              <button onClick={() => setPreviewCoverLetter(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-8 py-6">
              <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {previewCoverLetter.content ?? "No content available."}
              </div>
            </div>
          </div>
        </div>
      )}

      {candidateJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col relative">
            <button onClick={() => setCandidateJob(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10">
              <X size={20} />
            </button>

            <div className="p-8 pb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold mb-2">
                {candidateMode === "matches" ? "Best Matches" : "Applicants"} for {candidateJob.job_title}
              </h2>
              <p className="text-foreground/70">
                {candidateMode === "matches"
                  ? "Users whose resumes best match your job requirements. Invite promising candidates."
                  : "Candidates who applied or were invited."}
              </p>
            </div>

            <div className="px-8 pb-8 overflow-y-auto space-y-4">
              {loadingCandidates ? (
                <div className="flex items-center justify-center py-12 text-foreground/60">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading candidates…
                </div>
              ) : candidateError ? (
                <div className="border border-red-200 bg-red-50 rounded-xl p-8 text-center text-red-700">
                  {candidateError}
                </div>
              ) : candidates.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-foreground/60">
                  No candidates found for this view yet.
                </div>
              ) : (
                candidates.map((candidate, index) => (
                  <div key={candidate.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#088395] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold">{getCandidateName(candidate, index)}</h3>
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            <Star size={14} className="fill-green-700" />
                            <span className="text-sm font-semibold">{Math.round(Number(candidate.match_score || 0) * 100)}% Match</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                          <Info icon={<Clock size={14} />} text={candidate.created_at ? `Matched ${formatDate(candidate.created_at)}` : "Date unavailable"} />
                          <Info icon={<Briefcase size={14} />} text={candidate.resume?.target_job_title || "Resume target role unavailable"} />
                          <Info icon={<Mail size={14} />} text={`Status: ${labelize(candidate.status)}`} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        {candidateMode === "matches" ? (
                          candidate.status === "invited" ? (
                            <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                              Invited
                            </span>
                          ) : (
                            <button
                              onClick={() => inviteCandidate(candidate)}
                              className="px-4 py-2 bg-[#088395] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                            >
                              Invite
                            </button>
                          )
                        ) : (
                          <>
                            {candidate.status === "applied" && (
                              <>
                                <button
                                  onClick={() => updateCandidateStatus(candidate.id, "accepted")}
                                  className="px-4 py-2 bg-[#088395] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => updateCandidateStatus(candidate.id, "declined")}
                                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {candidate.status === "matched" && (
                              <button
                                onClick={() => updateCandidateStatus(candidate.id, "invited")}
                                className="px-4 py-2 bg-[#088395] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                              >
                                Invite
                              </button>
                            )}
                            {(candidate.status === "accepted" || candidate.status === "declined" || candidate.status === "invited") && (
                              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                candidate.status === "accepted" ? "bg-green-100 text-green-700" :
                                candidate.status === "declined" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {labelize(candidate.status)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {(candidate.resume || candidate.cover_letter?.content) && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                        {candidate.resume && (
                          <button
                            onClick={() => setPreviewResume(candidate.resume!)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#088395]/10 text-[#088395] rounded-lg text-sm font-semibold hover:bg-[#088395]/20 transition-colors"
                          >
                            <FileText size={15} />
                            Preview Resume
                          </button>
                        )}
                        {candidate.cover_letter?.content && (
                          <button
                            onClick={() => setPreviewCoverLetter(candidate.cover_letter!)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                          >
                            <Mail size={15} />
                            Preview Cover Letter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-foreground/70 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-foreground/70">{label}</p>
        </div>
      </div>
    </div>
  );
}

function JobDetailsModal({ job, onClose }: { job: CompanyJob; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={20} />
        </button>

        <div className="pr-8">
          <h2 className="text-2xl font-bold mb-2">{job.job_title}</h2>
          <p className="text-foreground/70 mb-6">Posted {formatDate(job.created_at)}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <Detail label="Status" value={job.is_active ? "Active" : "Closed"} />
          <Detail label="Location" value={job.job_location || "Not specified"} />
          <Detail label="Employment Type" value={labelize(job.employment_type)} />
          <Detail label="Salary" value={job.salary || "Not specified"} />
          <Detail label="Applicants" value={String(job.applicants_count ?? 0)} />
          <Detail label="Best Matches" value={String(job.best_matches_count ?? 0)} />
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-foreground/70 whitespace-pre-line">{job.description || "No description provided."}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.required_skills ?? []).length > 0 ? (
              job.required_skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-foreground/50">No skills listed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}