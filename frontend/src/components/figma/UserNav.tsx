"use client";

import { BookOpen, Briefcase, Building2, FileText, LayoutDashboard, LogOut, User, Crown } from "lucide-react";

export type UserNavPage =
    | "dashboard"
    | "templates"
    | "courses"
    | "company"
    | "landing"
    | "job-board"
    | "user-profile"
    | "company-profile";

interface UserNavProps {
    currentPage: string;
    onNavigate: (page: UserNavPage) => void;
    isCompany?: boolean;
    onLogout: () => void;
    isPro?: boolean;
}

export function UserNav({ currentPage, onNavigate, isCompany = false, onLogout, isPro = false }: UserNavProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-between items-center h-16">
                    <div className="text-2xl font-bold text-[#088395] cursor-pointer" onClick={() => onNavigate("landing")}>
                        <img src="/WireHire.png" alt="WireHire" className="h-14 w-auto" />
                    </div>

                    <div className="flex items-center gap-6">
                        {!isCompany && (
                            <>
                                <button
                                    onClick={() => onNavigate("dashboard")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === "dashboard" ? "bg-[#088395]/10 text-[#088395]" : "text-foreground/70 hover:text-foreground"}`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </button>

                                <button
                                    onClick={() => onNavigate("templates")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === "templates" ? "bg-[#088395]/10 text-[#088395]" : "text-foreground/70 hover:text-foreground"}`}
                                >
                                    <FileText size={18} />
                                    Templates
                                </button>

                                <button
                                    onClick={() => onNavigate("courses")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === "courses" ? "bg-[#088395]/10 text-[#088395]" : "text-foreground/70 hover:text-foreground"}`}
                                >
                                    <BookOpen size={18} />
                                    Courses
                                </button>

                                <button
                                    onClick={() => onNavigate("job-board")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === "job-board" ? "bg-[#088395]/10 text-[#088395]" : "text-foreground/70 hover:text-foreground"}`}
                                >
                                    <Briefcase size={18} />
                                    Find Jobs
                                </button>
                            </>
                        )}

                        {isCompany && (
                            <button
                                onClick={() => onNavigate("company")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === "company" ? "bg-[#088395]/10 text-[#088395]" : "text-foreground/70 hover:text-foreground"}`}
                            >
                                <Building2 size={18} />
                                Job Postings
                            </button>
                        )}

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                {isPro ? (
                                    <div className="relative">
                                        <User size={18} />
                                        <Crown size={10} className="absolute -top-1 -right-1 text-yellow-500" />
                                    </div>
                                ) : (
                                    <User size={18} />
                                )}
                                <span>Account</span>
                                {isPro && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-[10px] font-bold leading-none">
                                        <Crown size={8} />
                                        PRO
                                    </span>
                                )}
                            </button>

                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {isPro && (
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                                        <div className="flex items-center gap-2">
                                            <Crown size={14} className="text-yellow-500" />
                                            <span className="text-sm font-semibold text-yellow-700">Pro Member</span>
                                        </div>
                                        <p className="text-xs text-yellow-600/70 mt-0.5">All features unlocked</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => onNavigate(isCompany ? "company-profile" : "user-profile")}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <User size={16} />
                                    Profile
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}