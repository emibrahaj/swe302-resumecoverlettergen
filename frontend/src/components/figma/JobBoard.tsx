"use client";

import { useState } from "react";
import {
  Building2,
  Clock,
  DollarSign,
  Lock,
  MapPin,
  Search,
  X,
} from "lucide-react";

interface Job {
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

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    type: "full-time",
    salary: "$120k - $160k",
    postedDate: "2 days ago",
    description:
      "We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building beautiful, responsive web applications.",
    requirements: [
      "5+ years React experience",
      "TypeScript",
      "Modern CSS",
      "Team collaboration",
    ],
  },
  {
    id: "2",
    title: "Product Manager",
    company: "InnovateLabs",
    location: "New York, NY",
    type: "full-time",
    salary: "$140k - $180k",
    postedDate: "5 days ago",
    description:
      "Join our product team to drive innovation and deliver exceptional user experiences.",
    requirements: [
      "3+ years PM experience",
      "Agile methodology",
      "Data-driven decision making",
      "Stakeholder management",
    ],
  },
  {
    id: "3",
    title: "UX Designer",
    company: "DesignHub",
    location: "London, UK",
    type: "full-time",
    salary: "£60k - £80k",
    postedDate: "1 week ago",
    description:
      "Create beautiful and intuitive user experiences for our web and mobile applications.",
    requirements: [
      "Figma expertise",
      "User research",
      "Prototyping",
      "Portfolio required",
    ],
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Remote",
    type: "contract",
    salary: "$100 - $150/hr",
    postedDate: "3 days ago",
    description:
      "Help us build and maintain scalable cloud infrastructure using modern DevOps practices.",
    requirements: [
      "AWS/Azure/GCP",
      "Kubernetes",
      "CI/CD",
      "Infrastructure as Code",
    ],
  },
  {
    id: "5",
    title: "Data Scientist",
    company: "DataMinds",
    location: "San Francisco, CA",
    type: "full-time",
    salary: "$130k - $170k",
    postedDate: "4 days ago",
    description:
      "Analyze complex datasets and build machine learning models to drive business insights.",
    requirements: ["Python", "Machine Learning", "SQL", "Statistical analysis"],
  },
  {
    id: "6",
    title: "Marketing Manager",
    company: "GrowthCo",
    location: "Austin, TX",
    type: "full-time",
    salary: "$90k - $120k",
    postedDate: "1 week ago",
    description:
      "Lead our marketing efforts and develop strategies to grow our customer base.",
    requirements: ["Digital marketing", "SEO/SEM", "Content strategy", "Analytics"],
  },
];

interface JobBoardProps {
  onUpgrade?: () => void;
}

export function JobBoard({ onUpgrade }: JobBoardProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const freeJobLimit = 5;

  const filteredJobs = mockJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = (e: React.SubmitEvent) => {
    e.preventDefault();
    setShowApplicationModal(false);
    alert("Application submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Find Your Dream Job
              </h1>
              <p className="text-white/90">
                Browse thousands of job opportunities from verified companies
              </p>
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

              <button className="w-full py-2 bg-[#088395]/10 text-[#088395] rounded-lg hover:bg-purple-200 transition-colors">
                Set Up Alerts
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {filteredJobs.map((job, index) => {
              const isLocked = index >= freeJobLimit;
              const shouldBlurCompany = index < freeJobLimit;

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
                          <span className={shouldBlurCompany ? "blur-sm" : ""}>
                            {job.company}
                          </span>
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
                                <span className="w-1.5 h-1.5 bg-[#088395] rounded-full"></span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply();
                          }}
                          className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          Apply Now
                        </button>
                      </div>
                    )}
                  </div>

                  {isLocked && (
                    <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center z-10 backdrop-blur-none">
                      <div className="text-center p-6">
                        <Lock
                          size={48}
                          className="text-[#088395] mx-auto mb-4"
                        />

                        <h3 className="font-semibold text-lg mb-2">
                          Upgrade to View More Jobs
                        </h3>

                        <p className="text-foreground/70 mb-4 text-sm">
                          Subscribe to Pro to unlock all job listings
                        </p>

                        <button
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
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Upload Resume
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Cover Letter
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell us why you're a great fit for this role..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Submit Application
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