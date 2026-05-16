"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, Loader2, Lock, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { setAuthTokens } from "@/src/hooks/useAuth";

interface CompanyAuthProps {
  onComplete?: () => void;
  initialMode?: "login" | "register";
  onForgotPassword?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8091";

export function CompanyAuth({ onComplete, initialMode = "login", onForgotPassword }: CompanyAuthProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Register-only
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCompanyName("");
    setCompanyAddress("");
    setCompanyWebsite("");
    setAgreedTerms(false);
  };

  const handleLogin = async () => {
    const res = await fetch(`${API_BASE}/company/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.detail ?? `Login failed (${res.status})`);
    }
    const data = await res.json();
    if (!data.access_token) throw new Error("No token returned by company login");
    setAuthTokens(data.access_token, data.refresh_token ?? undefined, /* isCompany */ true);
    return data;
  };

  const handleRegister = async () => {
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    if (password !== confirmPassword) throw new Error("Passwords do not match.");
    if (!agreedTerms) throw new Error("You must accept the terms to register a company.");

    const registerRes = await fetch(`${API_BASE}/company/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        company_name: companyName,
        address: companyAddress || null,
        company_website: companyWebsite || null,
      }),
    });
    if (!registerRes.ok) {
      const data = await registerRes.json().catch(() => ({}));
      throw new Error(data?.detail ?? `Registration failed (${registerRes.status})`);
    }
    // Auto-login after register so the user lands on the portal.
    await handleLogin();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await handleLogin();
        toast.success("Welcome back!");
      } else {
        await handleRegister();
        toast.success("Company registered — pending verification");
      }
      if (onComplete) onComplete();
      router.push("/company/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#088395] rounded-2xl flex items-center justify-center">
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{mode === "login" ? "Company Login" : "Company Registration"}</h1>
              <p className="text-foreground/70">
                {mode === "login"
                  ? "Access your company portal to post jobs and find candidates."
                  : "Register your company to post jobs, browse applicants, and hire talent."}
              </p>
            </div>
          </div>

          {mode === "register" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note: </strong>Company accounts require verification. You&apos;ll receive a confirmation email
                once your account is approved (usually within 24 hours). You can browse the portal in read-only mode
                while we verify.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-semibold">Company Name</label>
                  <div className="relative">
                    <Building2 size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your Company Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Company Address</label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="123 Business St, City, Country"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Company Website (optional)</label>
                  <div className="relative">
                    <Globe size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://your-company.com"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block mb-2 text-sm font-semibold">Company Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="company@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 8 : 1}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                />
              </div>
              {mode === "register" && (
                <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
              )}
            </div>

            {mode === "register" && (
              <div>
                <label className="block mb-2 text-sm font-semibold">Confirm Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-[#088395] hover:text-purple-700"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === "register" && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  required
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-foreground/70">
                  I agree to the Terms of Service and Privacy Policy, and confirm that all company information
                  provided is accurate and verifiable.
                </label>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-4 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all ${
                submitting ? "opacity-60 cursor-wait" : ""
              }`}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting
                ? "Please wait…"
                : mode === "login"
                  ? "Login to Portal"
                  : "Submit for Verification"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/70">
              {mode === "login" ? "Don't have an account? " : "Already registered? "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  reset();
                }}
                className="text-[#088395] hover:text-purple-700 font-semibold"
              >
                {mode === "login" ? "Register your company" : "Login here"}
              </button>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Looking for a job?{" "}
              <a href="/" className="text-[#088395] hover:underline font-semibold">
                Job seeker sign-in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
