"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    setTimeout(() => {
      if (email !== "test@gmail.com" || password !== "123456") {
        setError("Invalid email or password. Please try again.");
      } else {
        alert("Sign in successful!");
      }

      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="grid min-h-[calc(100vh-88px)] grid-cols-1 items-center px-8 md:grid-cols-2 md:px-[96px]">
        <section className="max-w-[520px]">
          <h1 className="mb-16 text-[36px] font-bold text-[#924CCA]">
            Sign In
          </h1>

          {error && (
            <div className="mb-6 rounded-md bg-red-100 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-14">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border-0 border-b border-gray-400 bg-transparent px-0 py-3 text-[18px] outline-none placeholder:text-gray-500 focus:border-[#924CCA]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border-0 border-b border-gray-400 bg-transparent px-0 py-3 pr-10 text-[18px] outline-none placeholder:text-gray-500 focus:border-[#924CCA]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-lg"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-[16px] font-bold text-red-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-[190px] rounded-lg bg-[#924CCA] py-3 text-[20px] font-bold text-white transition hover:bg-[#7e3fb4] disabled:bg-[#b98dde]"
              >
                {loading ? "Loading..." : "Continue"}
              </button>
            </div>
          </form>
        </section>

        <section className="hidden justify-center md:flex">
          <div className="relative h-[456px] w-[570px]">
            <Image
              src="/assets/sign-in.png"
              alt="Sign in illustration"
              fill
              className="object-contain"
            />
          </div>
        </section>
      </div>
    </main>
  );
}