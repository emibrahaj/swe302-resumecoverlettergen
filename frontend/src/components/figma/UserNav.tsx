"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  User,
  X,
  FileText,
  Search,
  GraduationCap,
  Tag,
  Building2
} from "lucide-react";

export type UserNavPage =
  | "dashboard"
  | "templates"
  | "courses"
  | "company"
  | "landing"
  | "job-board"
  | "pricing"
  | "user-profile"
  | "company-profile";

interface UserNavProps {
  currentPage: string;
  onNavigate: (page: UserNavPage) => void;
  isCompany?: boolean;
  onLogout: () => void;
  isPro?: boolean;
}

export function UserNav({
  currentPage,
  onNavigate,
  isCompany = false,
  onLogout,
  isPro = false,
}: UserNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getLinkClass = (active: boolean) =>
    `transition-colors font-medium flex items-center gap-2 ${
      active ? "text-[#088395]" : "text-foreground hover:text-[#088395]"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO (LEFT) */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center cursor-pointer focus:outline-none"
          >
           <img src="/DiversiHire1.png" alt="DiversiHire" className="h-38 w-auto" />
          </button>

          {/* CENTER LINKS (ONLY FOR INDIVIDUAL USERS) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {!isCompany && (
              <>
                <button onClick={() => onNavigate("templates")} className={getLinkClass(currentPage === "templates")}>
                  Cover Letter
                </button>
                <button onClick={() => onNavigate("job-board")} className={getLinkClass(currentPage === "job-board")}>
                  Find Jobs
                </button>
                <button onClick={() => onNavigate("courses")} className={getLinkClass(currentPage === "courses")}>
                  Courses
                </button>
                <button onClick={() => onNavigate("pricing")} className={getLinkClass(currentPage === "pricing")}>
                  Pricing
                </button>
                <button onClick={() => onNavigate("company")} className={getLinkClass(currentPage === "company")}>
                  For Companies
                </button>
              </>
            )}
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="hidden md:flex items-center gap-6">
            {isCompany ? (
              /* COMPANY VIEW: Direct Flat Links with Icons */
              <>
                <button
                  onClick={() => onNavigate("company")}
                  className={getLinkClass(currentPage === "company")}
                >
                  <BookOpen size={18} />
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate("company-profile")}
                  className={getLinkClass(currentPage === "company-profile")}
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              /* USER VIEW: Account Dropdown */
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-foreground hover:text-[#088395] transition-colors font-medium">
                  Account
                  <ChevronDown size={16} />
                </button>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {isPro && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                      <div className="flex items-center gap-2">
                        <Crown size={14} className="text-yellow-500" />
                        <span className="text-sm font-semibold text-yellow-700">Pro Member</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigate("dashboard")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <BookOpen size={16} />
                    Dashboard
                  </button>

                  <button
                    onClick={() => onNavigate("user-profile")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100">
            {isCompany ? (
              /* Company Mobile View */
              <div className="flex flex-col px-2">
                <button
                  onClick={() => { onNavigate("company"); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 font-medium"
                >
                  <BookOpen size={20} className="text-[#088395]" />
                  Dashboard
                </button>
                <button
                  onClick={() => { onNavigate("company-profile"); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 font-medium"
                >
                  <User size={20} className="text-[#088395]" />
                  Profile
                </button>
                <button
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 font-medium text-red-600"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            ) : (
              /* User Mobile View */
              <div className="flex flex-col px-2">
                <button onClick={() => { onNavigate("templates"); setIsMenuOpen(false); }} className="flex items-center gap-3 py-3 px-4">
                  <FileText size={20} className="text-[#088395]" /> Cover Letter
                </button>
                <button onClick={() => { onNavigate("job-board"); setIsMenuOpen(false); }} className="flex items-center gap-3 py-3 px-4">
                  <Search size={20} className="text-[#088395]" /> Find Jobs
                </button>
                <button onClick={() => { onNavigate("dashboard"); setIsMenuOpen(false); }} className="flex items-center gap-3 py-3 px-4">
                  <BookOpen size={20} className="text-[#088395]" /> Dashboard
                </button>
                <button onClick={() => { onNavigate("user-profile"); setIsMenuOpen(false); }} className="flex items-center gap-3 py-3 px-4">
                  <User size={20} className="text-[#088395]" /> Profile
                </button>
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="flex items-center gap-3 py-3 px-4 text-red-600">
                  <LogOut size={20} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}