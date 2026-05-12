"use client";

import { PublicUserNav } from "@/src/components/figma/PublicUserNav";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicUserNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="text-center mb-12">
          <p className="text-[#088395] font-semibold mb-3">Legal</p>

          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Terms of Service
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            These Terms of Service explain the rules and conditions for using
            DiversiHire, including our resume builder, cover letter tools, job
            matching features, and related career services.
          </p>

          <p className="text-sm text-gray-500 mt-4">
            Last updated: May 2026
          </p>
        </section>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using DiversiHire, you agree to follow these Terms of
              Service. If you do not agree with these terms, you should not use
              the platform.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2. Use of the Platform
            </h2>
            <p>
              DiversiHire provides tools for creating resumes, generating cover
              letters, analyzing career documents, viewing templates, and
              exploring job-related opportunities. You agree to use the platform
              only for lawful and appropriate purposes.
            </p>
            <p className="mt-3">
              You must not misuse the platform, attempt to disrupt its
              functionality, access restricted areas without permission, or use
              the service in a way that may harm other users or DiversiHire.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              3. User Accounts
            </h2>
            <p>
              Some features may require an account. You are responsible for
              keeping your login information secure and for all activity that
              happens under your account.
            </p>
            <p className="mt-3">
              You agree to provide accurate information when creating or updating
              your account.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4. Resume and Cover Letter Content
            </h2>
            <p>
              You are responsible for the information you enter into resumes,
              cover letters, profiles, applications, reviews, or any other part
              of the platform.
            </p>
            <p className="mt-3">
              DiversiHire may help generate or improve content using AI-powered
              tools, but you should review all generated content before using it
              for job applications or professional purposes.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              5. AI-Generated Suggestions
            </h2>
            <p>
              DiversiHire may provide AI-generated resume suggestions, cover
              letters, job insights, skill recommendations, and other automated
              outputs. These outputs are provided for guidance only and do not
              guarantee job interviews, employment, application success, or
              specific career outcomes.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6. Payments and Subscriptions
            </h2>
            <p>
              Some DiversiHire features may be available through paid plans or
              subscriptions. Prices, billing periods, and available features may
              be shown on the pricing page or during checkout.
            </p>
            <p className="mt-3">
              By purchasing a paid plan, you agree to pay the listed fees and any
              applicable charges.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              7. Intellectual Property
            </h2>
            <p>
              DiversiHire, including its design, branding, templates, platform
              features, and software, belongs to DiversiHire or its licensors.
              You may not copy, sell, reproduce, or misuse platform materials
              without permission.
            </p>
            <p className="mt-3">
              Your personal resume and cover letter content remains your
              responsibility and is used to provide the services you request.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              8. Third-Party Services and Links
            </h2>
            <p>
              DiversiHire may include links or integrations with third-party
              services, such as payment providers, job platforms, analytics
              services, or authentication providers. We are not responsible for
              the content, policies, or practices of third-party websites or
              services.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              9. Limitation of Liability
            </h2>
            <p>
              DiversiHire is provided on an “as available” basis. We aim to provide
              a reliable and useful service, but we do not guarantee that the
              platform will always be error-free, uninterrupted, or suitable for
              every individual need.
            </p>
            <p className="mt-3">
              DiversiHire is not responsible for hiring decisions, rejected
              applications, employer responses, or outcomes resulting from the
              use of resumes, cover letters, or job suggestions created through
              the platform.
            </p>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              10. Changes to These Terms
            </h2>
            <p>
              We may update these Terms of Service from time to time. When we
              make changes, we may update the “Last updated” date at the top of
              this page. Continued use of DiversiHire means you accept the updated
              terms.
            </p>
          </section>

          <section className="bg-[#088395] rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-3">11. Contact Us</h2>
            <p className="text-white/90">
              If you have questions about these Terms of Service, please contact
              the DiversiHire support team.
            </p>
            <p className="mt-4 font-semibold">support@DiversiHire.com</p>
          </section>
        </div>
      </main>
    </div>
  );
}