"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  X,
  Lock,
  Crown,
  Bell,
  BellOff,
  CheckCircle,
} from "lucide-react";
import { api, ApiError } from "@/src/lib/api";
import { useLanguage } from "@/src/context/LanguageContext";

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
  forYouJobs?: Job[];
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

export function JobBoard({ onBack, onUpgrade, isPro = false, jobs = [], forYouJobs = [], loading = false }: JobBoardProps) {
  const { t } = useLanguage();
  const copy = t.jobBoard;
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

  const [alertsEnabled, setAlertsEnabled] = useState<boolean | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsMessage, setAlertsMessage] = useState<string | null>(null);

  const [typeFilters, setTypeFilters] = useState<Set<string>>(
    new Set(["full-time", "part-time", "contract"])
  );
  const [locationFilter, setLocationFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "for-you">("for-you");

  const toggleType = (type: string) =>
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });

  useEffect(() => {
    api.get<{ is_enabled: boolean }>("/job-alerts/status")
      .then((data) => setAlertsEnabled(data.is_enabled))
      .catch(() => setAlertsEnabled(false));
  }, []);

  const handleToggleAlerts = async () => {
    setAlertsLoading(true);
    setAlertsMessage(null);
    try {
      const next = !alertsEnabled;
      await api.post<{ is_enabled: boolean }>("/job-alerts/toggle", { is_enabled: next });
      setAlertsEnabled(next);
      setAlertsMessage(next ? copy.alertsEnabled : copy.alertsDisabled);
      setTimeout(() => setAlertsMessage(null), 3000);
    } catch {
      setAlertsMessage(copy.alertsError);
    } finally {
      setAlertsLoading(false);
    }
  };

  const freeJobLimit = 5;

  const sourceJobs = activeTab === "for-you" ? forYouJobs : jobs;

  const filteredJobs = sourceJobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q);

    const matchesType = typeFilters.size === 0 || typeFilters.has(job.type);

    const loc = job.location.toLowerCase();
    const matchesLocation =
      locationFilter === "all" ||
      (locationFilter === "remote" && loc.includes("remote")) ||
      (locationFilter === "on-site" && !loc.includes("remote"));

    return matchesSearch && matchesType && matchesLocation;
  });

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
      setApplyError(copy.loadDocumentsError);
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
      setApplyError(err instanceof ApiError ? err.message : copy.submitError);
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
              ← {copy.back}
            </button>
          )}

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {copy.title}
              </h1>
              <p className="text-white/90">
                {copy.subtitle}
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
                  {copy.proAccess}
                </>
              ) : (
                <>
                  <Lock size={13} />
                  {copy.freePreview}
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
              placeholder={copy.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#088395] focus:outline-none bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="mb-6 flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("for-you")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "for-you"
                ? "bg-white text-[#088395] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {copy.forYou}
            {forYouJobs.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#088395] text-white rounded-full">
                {forYouJobs.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "all"
                ? "bg-white text-[#088395] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {copy.allJobs}
          </button>
        </div>

        {!isPro && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-sm">
                {copy.freePreviewTitle}
              </h3>
              <p className="text-sm text-foreground/70">
                {copy.freePreviewDescription(freeJobLimit)}
              </p>
            </div>

            <button
              type="button"
              onClick={onUpgrade}
              className="px-5 py-2 bg-[#088395] text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
            >
              {copy.upgradeToPro}
            </button>
          </div>
        )}

        {isPro && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-yellow-600" />
              <h3 className="font-semibold text-sm text-yellow-800">
                {copy.proUnlockedTitle}
              </h3>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {copy.proUnlockedDescription}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">{copy.filters}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {copy.jobType}
                  </label>

                  <div className="space-y-2">
                    {(["full-time", "part-time", "contract"] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={typeFilters.has(type)}
                          onChange={() => toggleType(type)}
                        />
                        <span className="text-sm">{copy.jobTypes[type]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {copy.location}
                  </label>

                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none text-sm"
                  >
                    <option value="all">{copy.allLocations}</option>
                    <option value="remote">{copy.remote}</option>
                    <option value="on-site">{copy.onSite}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">{copy.jobAlerts}</h3>

              <p className="text-sm text-foreground/70 mb-3">
                {copy.jobAlertsDescription}
              </p>

              {alertsMessage && (
                <div className={`flex items-center gap-2 text-xs mb-3 px-3 py-2 rounded-lg ${
                  alertsMessage.startsWith("Failed")
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}>
                  <CheckCircle size={13} />
                  {alertsMessage}
                </div>
              )}

              <button
                type="button"
                disabled={alertsLoading || alertsEnabled === null}
                onClick={handleToggleAlerts}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  alertsEnabled
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-[#088395]/10 text-[#088395] hover:bg-[#088395]/20"
                }`}
              >
                {alertsEnabled ? <BellOff size={15} /> : <Bell size={15} />}
                {alertsLoading
                  ? copy.updating
                  : alertsEnabled
                  ? copy.disableAlerts
                  : copy.setUpAlerts}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-foreground/50">
                {copy.loadingJobs}
              </div>
            )}

            {!loading && filteredJobs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-foreground/50">
                {activeTab === "for-you"
                  ? copy.noForYouJobs
                  : copy.noJobsFound}
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
                              {copy.companyHidden}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                        {copy.jobTypes[job.type]}
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
                        {copy.posted} {job.postedDate}
                      </div>
                    </div>

                    <p className="text-foreground/70 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {selectedJob?.id === job.id && (
                      <div className="pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">{copy.requirements}</h4>

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
                            {copy.applyNow}
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
                            {copy.upgradeToApply}
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
                          {copy.upgradeToViewMore}
                        </h3>

                        <p className="text-foreground/70 mb-4 text-sm">
                          {copy.unlockAllListings}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpgrade?.();
                          }}
                          className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          {copy.upgradeToPro}
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
              {copy.applyFor} {selectedJob?.title}
            </h2>

            <p className="text-foreground/70 mb-6">
              {copy.at} {selectedJob?.company}
            </p>

            <form onSubmit={handleSubmitApplication} className="space-y-6">
              {applyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {applyError}
                </div>
              )}

              {applySuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {copy.applicationSubmitted}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  {copy.resume} <span className="text-red-500">*</span>
                </label>

                {resumes.length === 0 ? (
                  <p className="text-sm text-foreground/60 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                    {copy.noResumesFound}
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
                  {copy.coverLetter} <span className="text-foreground/40 font-normal">({copy.optional})</span>
                </label>

                <select
                  value={selectedCoverLetterId}
                  onChange={(e) => setSelectedCoverLetterId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                >
                  <option value="">{copy.none}</option>
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
                  {applying ? copy.submitting : copy.submitApplication}
                </button>

                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {copy.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

//test alerts post launch
