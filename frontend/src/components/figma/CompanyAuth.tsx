"use client";
import { useState } from 'react';
import { ArrowLeft, Building2, Mail, Lock, User, MapPin, Phone, FileText } from 'lucide-react';

interface CompanyAuthProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CompanyAuth({ onBack, onComplete }: CompanyAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#088395] rounded-2xl flex items-center justify-center">
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {mode === 'login' ? 'Company Login' : 'Company Registration'}
              </h1>
              <p className="text-foreground/70">
                {mode === 'login'
                  ? 'Access your company-login portal'
                  : 'Register your company-login to post jobs'}
              </p>
            </div>
          </div>

          {mode === 'register' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Company accounts require verification. You'll receive a confirmation email once your account is approved (usually within 24 hours).
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-semibold">Company Name</label>
                  <div className="relative">
                    <Building2 size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your Company Inc."
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Company Registration Number</label>
                  <div className="relative">
                    <FileText size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Registration/Tax ID"
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
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Contact Person Name</label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Contact Phone</label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      required
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
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block mb-2 text-sm font-semibold">Confirm Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-[#088395] hover:text-purple-700">
                  Forgot password?
                </a>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-foreground/70">
                  I agree to the Terms of Service and Privacy Policy, and confirm that all company information provided is accurate and verifiable.
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              {mode === 'login' ? 'Login to Portal' : 'Submit for Verification'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/70">
              {mode === 'login' ? "Don't have a company-login account? " : 'Already registered? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-[#088395] hover:text-purple-700 font-semibold"
              >
                {mode === 'login' ? 'Register your company-login' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
