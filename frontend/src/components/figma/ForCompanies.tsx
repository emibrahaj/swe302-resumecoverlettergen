"use client";
import { Building2, Users, Target, BarChart3, ArrowRight } from 'lucide-react';

const companyFeatures = [
  {
    icon: Building2,
    title: 'Verified Company Accounts',
    description: 'Get verified as a legitimate company and build trust with candidates'
  },
  {
    icon: Users,
    title: 'Post Job Openings',
    description: 'Create, edit, and manage multiple job positions with ease'
  },
  {
    icon: Target,
    title: 'Smart Candidate Matching',
    description: 'Connect with qualified candidates whose resumes match your requirements'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track applications, views, and hiring metrics in real-time'
  }
];

interface ForCompaniesProps {
  onRegisterClick?: () => void;
}

export function ForCompanies({ onRegisterClick }: ForCompaniesProps) {
  return (
    <section id="for-companies" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#088395]/10 rounded-full mb-6">
              <Building2 size={16} className="text-[#088395]" />
              <span className="text-sm text-[#088395]">For Companies</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Find the perfect candidates for your team
            </h2>
            <p className="text-xl text-foreground/70 mb-8">
              Join hundreds of companies using CVify to discover talented professionals and streamline your hiring process.
            </p>

            <div className="space-y-6 mb-8">
              {companyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#088395] rounded-xl flex items-center justify-center">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-foreground/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onRegisterClick}
              className="group px-8 py-4 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Register Your Company
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#088395]/20 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                <div className="border-2 border-[#088395]/30 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold mb-1">Senior Frontend Developer</h4>
                      <p className="text-sm text-foreground/70">Remote • Full-time</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-foreground/70">
                    <span>24 Applicants</span>
                    <span>•</span>
                    <span>8 Matches</span>
                  </div>
                </div>

                <div className="border-2 border-[#088395]/20 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold mb-1">Product Manager</h4>
                      <p className="text-sm text-foreground/70">New York • Hybrid</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-foreground/70">
                    <span>16 Applicants</span>
                    <span>•</span>
                    <span>5 Matches</span>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6 opacity-60">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold mb-1">UX Designer</h4>
                      <p className="text-sm text-foreground/70">London • Full-time</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      Closed
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-foreground/70">
                    <span>42 Applicants</span>
                    <span>•</span>
                    <span>Hired 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
