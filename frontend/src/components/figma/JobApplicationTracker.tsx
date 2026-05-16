import { useState } from 'react';
import { ArrowLeft, Briefcase, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  salary?: string;
}

interface JobApplicationTrackerProps {
  onBack: () => void;
}

export function JobApplicationTracker({ onBack }: JobApplicationTrackerProps) {
  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      appliedDate: '2 days ago',
      status: 'pending',
      salary: '$120k - $160k'
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      company: 'Innovation Labs',
      location: 'New York, NY',
      appliedDate: '5 days ago',
      status: 'accepted',
      salary: '$140k - $180k'
    },
    {
      id: '3',
      jobTitle: 'UX Designer',
      company: 'Creative Studios',
      location: 'San Francisco, CA',
      appliedDate: '1 week ago',
      status: 'rejected',
      salary: '$90k - $120k'
    },
    {
      id: '4',
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      appliedDate: '3 days ago',
      status: 'pending',
      salary: '$110k - $150k'
    }
  ]);

  const handleWithdraw = (id: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      setApplications(applications.filter(app => app.id !== id));
      alert('Application withdrawn successfully');
    }
  };

  const getStatusConfig = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Pending'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Accepted'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Rejected'
        };
    }
  };

  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const acceptedCount = applications.filter(app => app.status === 'accepted').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#088395] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
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
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">All Applications</h2>

          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase size={48} className="text-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Applications Yet</h3>
              <p className="text-foreground/70">
                You haven't applied to any jobs yet. Start browsing our job board!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const statusConfig = getStatusConfig(application.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={application.id}
                    className={`bg-white rounded-xl shadow-sm border-2 ${statusConfig.borderColor} p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{application.jobTitle}</h3>
                          <div className={`flex items-center gap-1 px-3 py-1 ${statusConfig.bgColor} rounded-full`}>
                            <StatusIcon size={14} className={statusConfig.color} />
                            <span className={`text-sm font-semibold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase size={14} />
                            {application.company}
                          </div>
                          <div>{application.location}</div>
                          {application.salary && <div>{application.salary}</div>}
                        </div>

                        <p className="text-sm text-foreground/60">
                          Applied {application.appliedDate}
                        </p>
                      </div>

                      {application.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Withdraw
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

                    {application.status === 'rejected' && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          Unfortunately, the company decided to move forward with other candidates.
                          Keep applying - your perfect job is out there!
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
