"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, CheckCircle, XCircle, Clock, Trash2, Mail } from 'lucide-react';
import { api, ApiError } from '@/src/lib/api';

type AppStatus = 'applied' | 'accepted' | 'declined' | 'invited';

interface ApiApplication {
  id: string;
  job_id: string;
  status: AppStatus;
  match_score: number;
  created_at: string;
  job_posting: {
    job_title: string;
    company_name: string | null;
    job_location: string | null;
    salary: string | null;
  } | null;
}

interface JobApplicationTrackerProps {
  onBack: () => void;
}

function formatDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

const STATUS_CONFIG: Record<AppStatus, { icon: React.ElementType; color: string; bgColor: string; borderColor: string; label: string }> = {
  applied: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending',
  },
  accepted: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Accepted',
  },
  declined: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Rejected',
  },
  invited: {
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Invited',
  },
};

export function JobApplicationTracker({ onBack }: JobApplicationTrackerProps) {
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    api.get<ApiApplication[]>('/applications/my-applications')
      .then(setApplications)
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (matchId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(matchId);
    try {
      await api.delete(`/applications/${matchId}`);
      setApplications((prev) => prev.filter((a) => a.id !== matchId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to withdraw application.');
    } finally {
      setWithdrawing(null);
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'applied').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const declinedCount = applications.filter((a) => a.status === 'declined').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#088395] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Back to Matched Jobs
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={32} />
            <h1 className="text-3xl font-bold">My Job Applications</h1>
          </div>
          <p className="text-cyan-100">Track your job applications and manage responses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Accepted</p>
                <p className="text-2xl font-bold">{acceptedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Rejected</p>
                <p className="text-2xl font-bold">{declinedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">All Applications</h2>

          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-foreground/50">
              Loading applications...
            </div>
          )}

          {error && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase size={48} className="text-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Applications Yet</h3>
              <p className="text-foreground/70">
                You haven't applied to any jobs yet. Start browsing our job board!
              </p>
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((application) => {
                const config = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.applied;
                const StatusIcon = config.icon;
                const job = application.job_posting;

                return (
                  <div
                    key={application.id}
                    className={`bg-white rounded-xl shadow-sm border-2 ${config.borderColor} p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold">{job?.job_title ?? 'Unknown Position'}</h3>
                          <div className={`flex items-center gap-1 px-3 py-1 ${config.bgColor} rounded-full`}>
                            <StatusIcon size={14} className={config.color} />
                            <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase size={14} />
                            {job?.company_name ?? 'Unknown Company'}
                          </div>
                          {job?.job_location && <div>{job.job_location}</div>}
                          {job?.salary && <div>{job.salary}</div>}
                        </div>

                        <p className="text-sm text-foreground/60">
                          Applied {formatDate(application.created_at)}
                        </p>
                      </div>

                      {application.status === 'applied' && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          disabled={withdrawing === application.id}
                          className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                          {withdrawing === application.id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                    </div>

                    {application.status === 'accepted' && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Congratulations!</strong> The company has shown interest in your application.
                          Check your email for next steps.
                        </p>
                      </div>
                    )}

                    {application.status === 'declined' && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          Unfortunately, the company decided to move forward with other candidates.
                          Keep applying — your perfect job is out there!
                        </p>
                      </div>
                    )}

                    {application.status === 'invited' && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>You've been invited!</strong> This company reached out to you directly.
                          Check your email and consider applying.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}