"use client";
import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  isCompany?: boolean;
}

export function ForgotPassword({ isCompany = false }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-foreground/70 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-foreground/60 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
        <p className="text-foreground/70 mb-6">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              {isCompany ? 'Company Email Address' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isCompany ? "company@example.com" : "your@email.com"}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
          >
            Send Reset Link
          </button>
        </form>

      </div>
    </div>
  );
}
