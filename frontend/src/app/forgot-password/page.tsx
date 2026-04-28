"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    setTimeout(() => {
      setMessage("If this email exists, a reset link has been sent.");
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="grid min-h-[calc(100vh-88px)] grid-cols-1 items-center px-8 md:grid-cols-2 md:px-[96px]">
        <section className="max-w-[520px]">
          <h1 className="mb-16 text-[36px] font-bold text-[#924CCA]">
            Forgot Password
          </h1>

          {message && (
            <div className="mb-6 rounded-md bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          <form onSubmit={handleReset}>
            <div className="mb-10">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border-0 border-b border-gray-400 bg-transparent px-0 py-3 text-[18px] outline-none placeholder:text-gray-500 focus:border-[#924CCA]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="mb-12 text-[15px] text-gray-500">
              Enter your email address and we’ll send you a password reset link.
            </p>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-[230px] rounded-lg bg-[#924CCA] py-3 text-[20px] font-bold text-white transition hover:bg-[#7e3fb4] disabled:bg-[#b98dde]"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/sign-in"
              className="text-[16px] font-bold text-red-500 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </section>

        <section className="hidden justify-center md:flex">
          <div className="relative h-[456px] w-[570px]">
            <Image
              src="/assets/sign-in.png"
              alt="Forgot password illustration"
              fill
              className="object-contain"
            />
          </div>
        </section>
      </div>
    </main>
  );
}