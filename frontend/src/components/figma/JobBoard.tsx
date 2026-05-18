"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  X,
  Lock,
  Crown,
} from "lucide-react";
import { api, ApiError } from "@/src/lib/api";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
}

interface JobBoardProps {
  onBack?: () => void;
  onUpgrade?: () => void;
  isPro?: boolean;
  jobs?: Job[];
  loading?: boolean;
}

interface Resume {
  id: string;
  target_job_title: string | null;
  created_at: string;
}

interface CoverLetter {
  id: string;
  title: string;
  created_at: string;
}

export function JobBoard({ onBack, onUpgrade, isPro = false, jobs = [], loading = false }: JobBoardProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const freeJobLimit = 5;

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = async () => {
    setApplyError(null);
    setApplySuccess(false);
    setShowApplicationModal(true);
    try {
      const [resumeData, clData] = await Promise.all([
        api.get<Resume[]>("/resume/my-resumes"),
        api.get<CoverLetter[]>("/cover-letters/"),
      ]);
      setResumes(resumeData);
      setCoverLetters(clData);
      if (resumeData.length > 0) setSelectedResumeId(resumeData[0].id);
      setSelectedCoverLetterId("");
    } catch {
      setApplyError("Failed to load your resumes and cover letters.");
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    setApplyError(null);
    try {
      await api.post(`/applications/apply/${selectedJob.id}`, {
        resume_id: selectedResumeId || null,
        cover_letter_id: selectedCoverLetterId || null,
      });
      setApplySuccess(true);
      setTimeout(() => setShowApplicationModal(false), 1500);
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.message : "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-5 text-white/80 hover:text-white text-sm font-semibold"
            >
              ← Back
            </button>
          )}

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Find Your Dream Job
              </h1>
              <p className="text-white/90">
                Browse job opportunities from verified companies
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                isPro
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-white/15 text-white border border-white/20"
              }`}
            >
              {isPro ? (
                <>
                  <Crown size={13} />
                  PRO ACCESS
                </>
              ) : (
                <>
                  <Lock size={13} />
                  FREE PREVIEW
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#088395] focus:outline-none bg-white shadow-sm"
            />
          </div>
        </div>

        {!isPro && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-sm">
                Free preview mode
              </h3>
              <p className="text-sm text-foreground/70">
                Company names are hidden and only the first {freeJobLimit} job
                postings are fully available.
              </p>
            </div>

            <button
              type="button"
              onClick={onUpgrade}
              className="px-5 py-2 bg-[#088395] text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {isPro && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-yellow-600" />
              <h3 className="font-semibold text-sm text-yellow-800">
                Pro job board unlocked
              </h3>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Company names are visible and all job postings are available.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Filters</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Type
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Full-time</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Part-time</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Contract</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>

                  <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm">
                    <option>All Locations</option>
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">Job Alerts</h3>

              <p className="text-sm text-foreground/70 mb-4">
                Get notified about new jobs matching your preferences
              </p>

              <button
                type="button"
                className="w-full py-2 bg-[#088395]/10 text-[#088395] rounded-lg hover:bg-[#088395]/20 transition-colors"
              >
                Set Up Alerts
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-foreground/50">
                Loading jobs...
              </div>
            )}

            {!loading && filteredJobs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-foreground/50">
                No job postings found.
              </div>
            )}

            {filteredJobs.map((job, index) => {
              const isLocked = !isPro && index >= freeJobLimit;

              return (
                <div
                  key={job.id}
                  onClick={() => !isLocked && setSelectedJob(job)}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 relative transition-all ${
                    isLocked
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:shadow-lg"
                  } ${
                    selectedJob?.id === job.id
                      ? "border-[#088395]"
                      : "border-gray-200"
                  }`}
                >
                  <div className={isLocked ? "blur-sm" : ""}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {job.title}
                        </h3>

                        <div className="flex items-center gap-2 text-foreground/70 mb-2">
                          <Building2 size={16} />

                          {isPro ? (
                            <span>{job.company}</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Company hidden
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                        {job.type.replace("-", " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </div>

                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        {job.salary}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        Posted {job.postedDate}
                      </div>
                    </div>

                    <p className="text-foreground/70 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {selectedJob?.id === job.id && (
                      <div className="pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Requirements:</h4>

                          <ul className="space-y-1">
                            {job.requirements.map((req, reqIndex) => (
                              <li
                                key={reqIndex}
                                className="text-sm text-foreground/70 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-[#088395] rounded-full" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {isPro ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply();
                            }}
                            className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            Apply Now
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpgrade?.();
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            <Lock size={16} />
                            Upgrade to Apply
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isLocked && (
                    <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center z-10">
                      <div className="text-center p-6">
                        <Lock
                          size={48}
                          className="text-[#088395] mx-auto mb-4"
                        />

                        <h3 className="font-semibold text-lg mb-2">
                          Upgrade to View More Jobs
                        </h3>

                        <p className="text-foreground/70 mb-4 text-sm">
                          Subscribe to Pro to unlock all job listings.
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpgrade?.();
                          }}
                          className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowApplicationModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-2">
              Apply for {selectedJob?.title}
            </h2>

            <p className="text-foreground/70 mb-6">
              at {selectedJob?.company}
            </p>

            <form onSubmit={handleSubmitApplication} className="space-y-6">
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
                  Resume <span className="text-red-500">*</span>
                </label>

                {resumes.length === 0 ? (
                  <p className="text-sm text-foreground/60 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                    No resumes found. Create one first.
                  </p>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.target_job_title ?? `Resume – ${new Date(r.created_at).toLocaleDateString()}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Cover Letter <span className="text-foreground/40 font-normal">(optional)</span>
                </label>

                <select
                  value={selectedCoverLetterId}
                  onChange={(e) => setSelectedCoverLetterId(e.target.value)}
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
                  disabled={applying || resumes.length === 0}
                  className="flex-1 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
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