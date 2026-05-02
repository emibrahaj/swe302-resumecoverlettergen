"use client";
import { TrendingUp, Sparkles, Briefcase, Target } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Resume Strengthening',
    description: 'Get a detailed analysis of your resume with a strength score and actionable suggestions to improve your chances of landing interviews.',
    highlight: true
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Cover Letters',
    description: 'Generate compelling, personalized cover letters in seconds using our advanced AI that understands job requirements and your experience.',
    highlight: true
  },
  {
    icon: Briefcase,
    title: 'Job Postings',
    description: 'Access thousands of verified job openings from top companies. Apply directly with your CVify resume and track all applications in one place.',
    highlight: true
  },
  {
    icon: Target,
    title: 'Score Matching to Market',
    description: 'Our intelligent algorithm compares your resume against industry standards and job requirements, giving you a competitive edge.',
    highlight: true
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Powerful Features to Land Your Dream Job
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Advanced AI tools and market insights to make your resume stand out
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-[#088395]/5 border-2 border-[#088395]/20 hover:shadow-xl hover:border-[#088395]/40 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-[#088395] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#088395]">{feature.title}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
