"use client";
import {useState} from 'react';
import {Menu, X} from 'lucide-react';

interface NavbarProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
    onDemoClick?: () => void;
    onPricingClick?: () => void;
    onCompanyClick?: () => void;
    onJobsClick?: () => void;
    onCoursesClick?: () => void;
}

export function Navbar({
                           onLoginClick,
                           onSignupClick,
                           onPricingClick,
                           onCompanyClick,
                           onJobsClick,
                           onCoursesClick
                       }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
            <span className="text-2xl font-bold text-[#088395]">
              WireHire
            </span>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({behavior: 'smooth'});
                            }}
                            className="text-foreground hover:text-foreground transition-colors"
                        >
                            Features
                        </button>
                        {onJobsClick && (
                            <button
                                onClick={onJobsClick}
                                className="text-foreground hover:text-foreground transition-colors"
                            >
                                Find Jobs
                            </button>
                        )}
                        {onCoursesClick && (
                            <button
                                onClick={onCoursesClick}
                                className="text-foreground hover:text-foreground transition-colors"
                            >
                                Courses
                            </button>
                        )}
                        {onPricingClick ? (
                            <button
                                onClick={onPricingClick}
                                className="text-foreground hover:text-foreground transition-colors"
                            >
                                Pricing
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});
                                }}
                                className="text-foreground hover:text-foreground transition-colors"
                            >
                                Pricing
                            </button>
                        )}
                        {onCompanyClick && (
                            <button
                                onClick={onCompanyClick}
                                className="text-foreground hover:text-foreground transition-colors"
                            >
                                For Companies
                            </button>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={onLoginClick}
                            className="px-4 py-2 text-foreground hover:text-[#088395] transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={onSignupClick}
                            className="px-6 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 space-y-4">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({behavior: 'smooth'});
                                setIsMenuOpen(false);
                            }}
                            className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                        >
                            Features
                        </button>
                        {onJobsClick && (
                            <button
                                onClick={() => {
                                    onJobsClick();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                            >
                                Find Jobs
                            </button>
                        )}
                        {onCoursesClick && (
                            <button
                                onClick={() => {
                                    onCoursesClick();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                            >
                                Courses
                            </button>
                        )}
                        {onPricingClick && (
                            <button
                                onClick={() => {
                                    onPricingClick();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                            >
                                Pricing
                            </button>
                        )}
                        {onCompanyClick && (
                            <button
                                onClick={() => {
                                    onCompanyClick();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                            >
                                For Companies
                            </button>
                        )}
                        <div className="flex flex-col gap-2 pt-4">
                            <button
                                onClick={() => {
                                    onLoginClick();
                                    setIsMenuOpen(false);
                                }}
                                className="px-4 py-2 text-foreground border border-border rounded-lg"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => {
                                    onSignupClick();
                                    setIsMenuOpen(false);
                                }}
                                className="px-4 py-2 bg-[#088395] text-white rounded-lg"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
