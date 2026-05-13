"use client";
import {useEffect, useState} from 'react';
import {Building2, Lock, Mail, User, X} from 'lucide-react';
import {setAuthTokens} from '@/src/hooks/useAuth';

// ─── Brand logos ──────────────────────────────────────────────────────────
function GoogleLogo({size = 18}: {size?: number}) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
    );
}

function LinkedInLogo({size = 18}: {size?: number}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065a2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
    );
}

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
    const [oauthBusy, setOauthBusy] = useState<'google' | 'linkedin' | null>(null);

    const handleOAuth = (provider: 'google' | 'linkedin') => {
        setError(null);
        setOauthBusy(provider);
        if (typeof window === 'undefined') return;
        // Where to send the user after sign-in. Default to dashboard; respect
        // any saved "intended page" if you wire that later.
        const returnTo = '/user/dashboard';
        // Top-level redirect — the user goes to Google/LinkedIn's login screen,
        // approves the OAuth consent, then bounces back to /auth/callback with
        // tokens. (If real OAuth credentials aren't configured yet, the backend
        // transparently substitutes a dev-mode signup so the buttons still work.)
        window.location.href = `${API_BASE}/auth/oauth/${provider}/start?return_to=${encodeURIComponent(returnTo)}`;
    };

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative my-4 sm:my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10 bg-white/80 backdrop-blur"
                >
                    <X size={20}/>
                </button>

                <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-foreground/70 mb-5 text-sm">
                    {mode === 'login'
                        ? 'Log in to access your saved resumes'
                        : 'Sign up to save your resumes and unlock premium features'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
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

                <div className="mt-4 text-center">
                    <p className="text-foreground/70 text-sm">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => {setMode(mode === 'login' ? 'signup' : 'login'); setError(null);}}
                            className="text-[#088395] hover:text-purple-700 font-semibold"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>

                <div className="mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-foreground/70">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleOAuth('google')}
                            disabled={oauthBusy !== null}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-wait`}
                        >
                            <GoogleLogo />
                            <span className="font-medium">{oauthBusy === 'google' ? 'Signing in…' : 'Google'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuth('linkedin')}
                            disabled={oauthBusy !== null}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-wait`}
                        >
                            <LinkedInLogo />
                            <span className="font-medium">{oauthBusy === 'linkedin' ? 'Signing in…' : 'LinkedIn'}</span>
                        </button>
                    </div>
                </div>

                {/* Subtle entry-point to the company / employer portal */}
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <a
                        href="/company/login"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-[#088395] transition-colors"
                    >
                        <Building2 size={12} />
                        Are you an employer?
                        <span className="font-semibold text-[#088395]">Company sign-in →</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
