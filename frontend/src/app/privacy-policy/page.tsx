"use client";

import { PublicUserNav } from "@/src/components/figma/PublicUserNav";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicUserNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="text-center mb-12">
          <p className="text-[#088395] font-semibold mb-3">Legal</p>

          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Privacy Policy
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            This Privacy Policy explains how WireHire collects, uses, stores,
            and protects user information when using our resume, cover letter,
            job matching, and career support services.
          </p>

          <p className="text-sm text-gray-500 mt-4">
            Last updated: May 2026
          </p>
        </section>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you use WireHire, we may collect personal information that
              you provide directly, such as your name, email address, account
              details, resume information, cover letter content, skills,
              education, work experience, and other career-related details.
            </p>
            <p className="mt-3">
              We may also collect technical information such as your IP address,
              browser type, device information, and usage activity to help us
              improve the platform and keep it secure.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide and improve WireHire services,
              including creating resumes, generating cover letters, saving your
              documents, analyzing resume strength, suggesting job matches, and
              personalizing your experience.
            </p>
            <p className="mt-3">
              We may also use your information to communicate with you about
              your account, respond to support requests, improve our features,
              and maintain the security of the platform.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              3. Resume and Cover Letter Data
            </h2>
            <p>
              WireHire allows users to create, edit, save, and manage resumes
              and cover letters. The information you enter into these documents
              may include personal and professional details such as contact
              information, education, work history, skills, projects, and career
              goals.
            </p>
            <p className="mt-3">
              This data is stored so that you can access, edit, and reuse your
              documents later.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4. Reviews and Feedback
            </h2>
            <p>
              If you choose to leave a review, we may display your submitted
              name, role/title, rating, and review text on our website or inside
              the platform. You should only submit information that you are
              comfortable sharing publicly.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              5. Cookies and Analytics
            </h2>
            <p>
              WireHire may use cookies or similar technologies to remember user
              preferences, improve website performance, understand how visitors
              use the platform, and support basic functionality.
            </p>
            <p className="mt-3">
              You may disable cookies through your browser settings, but some
              parts of the platform may not work properly without them.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6. Sharing Information with Third Parties
            </h2>
            <p>
              We do not sell your personal information. We may share limited
              information with trusted service providers only when necessary to
              operate the platform, process payments, provide authentication,
              store data, improve services, or comply with legal requirements.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              7. Data Security
            </h2>
            <p>
              We take reasonable technical and organizational measures to protect
              user data against unauthorized access, misuse, loss, or disclosure.
              However, no online platform can guarantee complete security.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              8. Data Retention
            </h2>
            <p>
              We keep your personal information for as long as necessary to
              provide our services, maintain your account, comply with legal
              obligations, resolve disputes, and improve the platform.
            </p>
            <p className="mt-3">
              You may request deletion of your account or personal data, subject
              to technical and legal limitations.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              9. Your Rights
            </h2>
            <p>
              Depending on applicable law, you may have the right to access,
              correct, update, delete, restrict, or request a copy of your
              personal data. You may also object to certain types of processing.
            </p>
          </section>

          <section className="bg-[#088395] rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-3">10. Contact Us</h2>
            <p className="text-white/90">
              If you have questions about this Privacy Policy or your personal
              data, please contact the WireHire support team.
            </p>
            <p className="mt-4 font-semibold">support@wirehire.com</p>
          </section>
        </div>
      </main>
    </div>
  );
}