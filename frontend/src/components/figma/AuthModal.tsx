"use client";
import {useEffect, useState} from 'react';
import {Lock, Mail, User, X} from 'lucide-react';
import {setAuthTokens} from '@/src/hooks/useAuth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: 'login' | 'signup';
    onComplete?: () => void;
    onForgotPassword?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Attempt real login/signup against the backend.
 * Returns the access_token string on success.
 * Throws an Error with a user-friendly message on failure.
 * Throws a TypeError (subclass of Error) on network failure (backend not running).
 */
async function callAuthApi(
    mode: 'login' | 'signup',
    email: string,
    password: string,
    fullName: string
): Promise<{ access_token: string; refresh_token?: string }> {
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body = mode === 'login'
        ? {email, password}
        : {email, password, full_name: fullName};

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `Authentication failed (${res.status})`);
    }

    return res.json();
}

export function AuthModal({isOpen, onClose, initialMode, onComplete, onForgotPassword}: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMode(initialMode);
        setError(null);
    }, [initialMode, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Try the real backend first.
            const data = await callAuthApi(mode, email, password, fullName);
            setAuthTokens(data.access_token, data.refresh_token, false);
        } catch (err: unknown) {
            if (err instanceof TypeError) {
                // Network error — backend is not reachable.
                // Store a mock dev token so the navbar / routing can be tested.
                console.warn('[AuthModal] Backend unreachable — using mock session for UI development.');
                setAuthTokens('dev-mock-token', undefined, false);
            } else {
                // Real auth error (wrong password, 4xx, etc.) — surface it.
                setError(err instanceof Error ? err.message : 'Something went wrong');
                setIsSubmitting(false);
                return;
            }
        }

        setIsSubmitting(false);
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
                    <X size={20}/>
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
                                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 text-sm">Email</label>
                        <div className="relative">
                            <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Password</label>
                        <div className="relative">
                            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {mode === 'login' && (
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

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-foreground/70">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => {setMode(mode === 'login' ? 'signup' : 'login'); setError(null);}}
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
