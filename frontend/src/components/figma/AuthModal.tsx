"use client";
import { useState, useEffect } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  onComplete?: () => void;
}

export function AuthModal({ isOpen, onClose, initialMode, onComplete }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold mb-2">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-foreground/70 mb-8">
          {mode === 'login'
            ? 'Log in to access your saved resumes'
            : 'Sign up to save your resumes and unlock premium features'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block mb-2 text-sm">Full Name</label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm">Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <a href="#" className="text-sm text-[#088395] hover:text-purple-700">
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-foreground/70">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[#088395] hover:text-purple-700 font-semibold"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-foreground/70">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Google
            </button>
            <button className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
