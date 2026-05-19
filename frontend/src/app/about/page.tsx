"use client";

import { PublicUserNav } from "@/src/components/figma/PublicUserNav";
import { Footer } from "@/src/components/figma/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicUserNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <section className="text-center mb-16">
          <p className="text-[#088395] font-semibold mb-3">About DiversiHire</p>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Helping people build stronger resumes and find better opportunities
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            DiversiHire is an AI-powered resume and career platform designed to help
            users create professional resumes, generate cover letters, discover job
            opportunities, and improve their chances of landing their dream role.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to make career preparation easier, faster, and more
              accessible. We want every user to create a resume that clearly
              presents their skills, experience, and potential.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
            <p className="text-gray-600 leading-relaxed">
              DiversiHire provides resume building tools, cover letter generation,
              template selection, AI-powered resume analysis, job matching, and
              career improvement features in one simple platform.
            </p>
          </div>
        </section>

        <section className="bg-[#088395] rounded-2xl p-8 sm:p-10 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Why DiversiHire?</h2>
          <p className="text-white/90 leading-relaxed max-w-4xl">
            Many job seekers struggle to present themselves professionally.
            DiversiHire helps bridge that gap by combining clean resume templates,
            smart AI suggestions, and career-focused tools that support users from
            resume creation to job discovery.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-10">Our Values</h2>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <h3 className="font-bold mb-2">Simplicity</h3>
              <p className="text-gray-600 text-sm">
                We keep the resume-building process easy and beginner-friendly.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <h3 className="font-bold mb-2">Opportunity</h3>
              <p className="text-gray-600 text-sm">
                We help users connect their skills with better career paths.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <h3 className="font-bold mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">
                We use AI tools to make career preparation smarter and faster.
              </p>
            </div>
          </div>
        </section>
            </main>

      <Footer />
    </div>
  );
}