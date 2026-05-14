import { useState } from 'react';
import { Building2, Plus, Edit, Trash2, Eye, Users, MapPin, Clock, DollarSign, Briefcase, ArrowLeft, X, Mail, Phone, Download, Star } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  matchScore: number;
  resumeUrl: string;
  experience: string;
  education: string;
  skills: string[];
}

interface JobPosting {
  id: string;
  title: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary: string;
  applicants: number;
  matches: number;
  status: 'active' | 'closed';
  postedDate: string;
  applicantsList?: Applicant[];
}

interface CompanyPortalProps {
  onBack?: () => void;
}

export function CompanyPortal({ onBack }: CompanyPortalProps) {
  const mockApplicants: Applicant[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      appliedDate: '2 days ago',
      matchScore: 95,
      resumeUrl: '#',
      experience: '6 years in Frontend Development',
      education: 'BS Computer Science, MIT',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL']
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      appliedDate: '3 days ago',
      matchScore: 88,
      resumeUrl: '#',
      experience: '5 years in Full Stack Development',
      education: 'MS Software Engineering, Stanford',
      skills: ['React', 'JavaScript', 'Python', 'Docker', 'MongoDB']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '+1 (555) 345-6789',
      appliedDate: '4 days ago',
      matchScore: 82,
      resumeUrl: '#',
      experience: '4 years in Frontend Development',
      education: 'BS Information Systems, UC Berkeley',
      skills: ['React', 'Vue.js', 'CSS', 'JavaScript', 'REST APIs']
    }
  ];

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      location: 'Remote',
      type: 'full-time',
      salary: '$120k - $160k',
      applicants: 24,
      matches: 8,
      status: 'active',
      postedDate: '2 days ago',
      applicantsList: mockApplicants
    },
    {
      id: '2',
      title: 'Product Manager',
      location: 'New York, NY',
      type: 'full-time',
      salary: '$140k - $180k',
      applicants: 16,
      matches: 5,
      status: 'active',
      postedDate: '5 days ago',
      applicantsList: mockApplicants.slice(0, 2)
    },
    {
      id: '3',
      title: 'UX Designer',
      location: 'London, UK',
      type: 'full-time',
      salary: '£70k - £90k',
      applicants: 42,
      matches: 12,
      status: 'closed',
      postedDate: '1 month ago',
      applicantsList: mockApplicants
    }
  ]);

  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [viewingApplicants, setViewingApplicants] = useState<JobPosting | null>(null);
  const [viewingBestMatches, setViewingBestMatches] = useState(false);
  const [previewingCV, setPreviewingCV] = useState<Applicant | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract',
    experienceLevel: 'Mid Level',
    salary: '',
    description: '',
    skills: ''
  });

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      setJobPostings(jobPostings.filter(job => job.id !== id));
    }
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      location: job.location,
      type: job.type,
      experienceLevel: 'Mid Level',
      salary: job.salary,
      description: '',
      skills: ''
    });
    setShowNewJobForm(true);
  };

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJob) {
      // Update existing job
      setJobPostings(jobPostings.map(job =>
        job.id === editingJob.id
          ? { ...job, ...formData, postedDate: 'Updated just now' }
          : job
      ));
    } else {
      // Create new job
      const newJob: JobPosting = {
        id: Date.now().toString(),
        title: formData.title,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        applicants: 0,
        matches: 0,
        status: 'active',
        postedDate: 'Just now'
      };
      setJobPostings([newJob, ...jobPostings]);
    }

    // Reset form
    setShowNewJobForm(false);
    setEditingJob(null);
    setFormData({
      title: '',
      location: '',
      type: 'full-time',
      experienceLevel: 'Mid Level',
      salary: '',
      description: '',
      skills: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#088395] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 size={32} />
                <h1 className="text-3xl font-bold">Company Portal</h1>
              </div>
              <p className="text-cyan-100">Manage your job postings and find the perfect candidates</p>
            </div>
            <button
              onClick={() => {
                setEditingJob(null);
                setFormData({
                  title: '',
                  location: '',
                  type: 'full-time',
                  experienceLevel: 'Mid Level',
                  salary: '',
                  description: '',
                  skills: ''
                });
                setShowNewJobForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              Post New Job
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                <Briefcase size={24} className="text-[#088395]" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Active Jobs</p>
                <p className="text-2xl font-bold">
                  {jobPostings.filter(j => j.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-pink-600" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Total Applicants</p>
                <p className="text-2xl font-bold">
                  {jobPostings.reduce((acc, j) => acc + j.applicants, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                <Eye size={24} className="text-[#088395]" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Strong Matches</p>
                <p className="text-2xl font-bold">
                  {jobPostings.reduce((acc, j) => acc + j.matches, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Building2 size={24} className="text-pink-600" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm">Positions Filled</p>
                <p className="text-2xl font-bold">
                  {jobPostings.filter(j => j.status === 'closed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showNewJobForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button
                onClick={() => {
                  setShowNewJobForm(false);
                  setEditingJob(null);
                }}
                className="text-foreground/70 hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold">Employment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'full-time' | 'part-time' | 'contract' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                    <option>Lead/Principal</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $100k - $150k"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">Job Description</label>
                <textarea
                  rows={8}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">Required Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewJobForm(false)}
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

          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase size={16} />
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
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
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 hover:bg-[#088395]/5 rounded-lg text-[#088395]"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users size={24} className="text-[#088395]" />
                      <div>
                        <p className="text-2xl font-bold">{job.applicants}</p>
                        <p className="text-sm text-foreground/70">Total Applicants</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Eye size={24} className="text-pink-600" />
                      <div>
                        <p className="text-2xl font-bold">{job.matches}</p>
                        <p className="text-sm text-foreground/70">Strong Matches</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setViewingApplicants(job);
                        setViewingBestMatches(false);
                      }}
                      className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      View Applicants
                    </button>
                    <button
                      onClick={() => {
                        setViewingApplicants(job);
                        setViewingBestMatches(true);
                      }}
                      className="px-6 py-3 border-2 border-[#088395] text-[#088395] rounded-lg font-semibold hover:bg-[#088395]/5 transition-all"
                    >
                      View Best Matches
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applicants Modal */}
      {viewingApplicants && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col relative">
            <button
              onClick={() => {
                setViewingApplicants(null);
                setViewingBestMatches(false);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 pb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold mb-2">
                {viewingBestMatches ? 'Best Matches' : 'Applicants'} for {viewingApplicants.title}
              </h2>
              <p className="text-foreground/70">
                {viewingBestMatches
                  ? `${viewingApplicants.applicantsList?.filter(a => a.matchScore >= 85).length || 0} candidates with 85%+ match score`
                  : `${viewingApplicants.applicantsList?.length || 0} total applicants • ${viewingApplicants.matches} strong matches`
                }
              </p>
            </div>

            <div className="px-8 pb-8 overflow-y-auto space-y-4">
              {viewingApplicants.applicantsList
                ?.filter(applicant => !viewingBestMatches || applicant.matchScore >= 85)
                .map((applicant, index) => (
                <div
                  key={applicant.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#088395] transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {viewingBestMatches ? `Candidate #${index + 1}` : applicant.name}
                        </h3>
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          <Star size={14} className="fill-green-700" />
                          <span className="text-sm font-semibold">{applicant.matchScore}% Match</span>
                        </div>
                      </div>
                      {!viewingBestMatches && (
                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            {applicant.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {applicant.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            Applied {applicant.appliedDate}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground/70 mb-2">Experience</h4>
                      <p className="text-sm">{applicant.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground/70 mb-2">Education</h4>
                      <p className="text-sm">{applicant.education}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-foreground/70 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewingCV(applicant)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Eye size={16} />
                      Preview CV
                    </button>
                    <button
                      onClick={() => {
                        alert(viewingBestMatches ? 'Downloading CV...' : `Downloading CV for ${applicant.name}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-[#088395] text-[#088395] rounded-lg hover:bg-[#088395]/5 transition-colors"
                    >
                      <Download size={16} />
                      Download CV
                    </button>
                    {!viewingBestMatches && (
                      <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors">
                        <Mail size={16} />
                        Contact
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CV Preview Modal */}
      {previewingCV && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col relative">
            <button
              onClick={() => setPreviewingCV(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">CV Preview</h2>
                <button
                  onClick={() => {
                    alert(viewingBestMatches ? 'Downloading CV...' : `Downloading CV for ${previewingCV.name}`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Download size={16} />
                  Download CV
                </button>
              </div>
            </div>

            <div className="px-8 pb-8 overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200">
              <div className="bg-white p-8 shadow-sm">
                <div className="mb-6 pb-6 border-b-2 border-gray-200">
                  {viewingBestMatches ? (
                    <>
                      <div className="bg-gray-200 h-8 w-48 mb-2 rounded"></div>
                      <div className="bg-gray-100 h-4 w-64 rounded"></div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold mb-2">{previewingCV.name}</h1>
                      <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                        <div className="flex items-center gap-1">
                          <Mail size={16} />
                          {previewingCV.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={16} />
                          {previewingCV.phone}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-[#088395]">Professional Summary</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {previewingCV.experience} with expertise in modern web technologies.
                    Strong background in developing scalable applications and leading technical initiatives.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-[#088395]">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewingCV.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-[#088395]">Experience</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {viewingBestMatches ? (
                            <>
                              <div className="bg-gray-200 h-5 w-40 mb-2 rounded"></div>
                              <div className="bg-gray-100 h-4 w-32 rounded"></div>
                            </>
                          ) : (
                            <>
                              <h4 className="font-semibold mb-1">Senior Software Engineer</h4>
                              <p className="text-sm text-foreground/70">Tech Company Inc.</p>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-foreground/70">2020 - Present</span>
                      </div>
                      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 ml-2">
                        <li>Led development of key platform features</li>
                        <li>Implemented scalable architecture solutions</li>
                        <li>Mentored junior developers</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {viewingBestMatches ? (
                            <>
                              <div className="bg-gray-200 h-5 w-36 mb-2 rounded"></div>
                              <div className="bg-gray-100 h-4 w-28 rounded"></div>
                            </>
                          ) : (
                            <>
                              <h4 className="font-semibold mb-1">Software Developer</h4>
                              <p className="text-sm text-foreground/70">StartupXYZ</p>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-foreground/70">2018 - 2020</span>
                      </div>
                      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 ml-2">
                        <li>Developed responsive web applications</li>
                        <li>Collaborated with cross-functional teams</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#088395]">Education</h3>
                  <div>
                    <p className="font-medium">{previewingCV.education}</p>
                  </div>
                </div>
              </div>

              {viewingBestMatches && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Personal information (name, contact details, specific company names)
                    has been removed for privacy. Download the full CV to view complete details.
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
