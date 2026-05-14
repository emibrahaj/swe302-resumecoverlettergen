"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";
import { Footer } from "@/src/components/figma/Footer";
import { api, ApiError } from "@/src/lib/api";

export default function ContactPage() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const toastId = toast.loading("Sending your message…");
    try {
      const res = await api.post<{
        status: string;
        delivered_via_email: boolean;
        recipient: string;
        message: string;
      }>(
        "/contact/send",
        { name, email, subject, message },
        { auth: false },
      );
      toast.success(res.message || "Your message has been received.", { id: toastId });
      setSent(true);
      setSubject("");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send — please try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PublicUserNav />

      <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-10 text-center text-4xl font-semibold tracking-[0.2em] text-gray-900">
            Contact us
          </h1>

          <div className="rounded-sm bg-white p-8 shadow-md sm:p-10">
            <p className="mb-8 leading-7 text-gray-800">
              Do you have a question, remark, complaint, or suggestion? Please
              contact the DiversiHire team using the form below.
            </p>

            {sent && (
              <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Thanks! Your message has been received. We&apos;ll get back to you
                at the email address you provided.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="h-12 w-full rounded-sm border border-gray-200 bg-gray-100 px-4 text-gray-700 outline-none transition focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20"
                >
                  <option value="">Make a choice</option>
                  <option value="General question">General question</option>
                  <option value="Resume builder issue">
                    Resume builder issue
                  </option>
                  <option value="Cover letter issue">Cover letter issue</option>
                  <option value="Company account issue">
                    Company account issue
                  </option>
                  <option value="Pricing or subscription">
                    Pricing or subscription
                  </option>
                  <option value="Feedback or suggestion">
                    Feedback or suggestion
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 w-full rounded-sm border border-gray-200 bg-gray-100 px-4 text-gray-700 outline-none transition focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-sm border border-gray-200 bg-gray-100 px-4 text-gray-700 outline-none transition focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Question or remark
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full resize-none rounded-sm border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 outline-none transition focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`mt-4 h-12 w-full rounded-full bg-[#088395] font-semibold text-white transition hover:bg-[#066d7b] ${sending ? "opacity-75 cursor-wait" : ""}`}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 block w-full text-center text-sm text-gray-500 transition hover:text-[#088395]"
            >
              Back to home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
