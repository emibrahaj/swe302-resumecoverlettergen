"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { LanguageToggle } from "@/src/components/figma/LanguageToggle";

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
  const router = useRouter();
  const { t } = useLanguage();

  const getLinkClass = (active: boolean) =>
    `transition-colors font-medium flex items-center gap-2 ${
      active ? "text-[#088395]" : "text-foreground hover:text-[#088395]"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          <button
            onClick={() => onNavigate("landing")}
            className="flex flex-shrink-0 items-center cursor-pointer focus:outline-none"
            aria-label={t.nav.home}
          >
            <img
              src="/DiversiHire1.png"
              alt="DiversiHire"
              className="h-38 w-auto"
            />
          </button>

          <div className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-3 lg:gap-5 xl:gap-7">
            {!isCompany && (
              <>
                <button
                  onClick={() => router.push("/templates/showcase")}
                  className={`flex items-center gap-1.5 font-semibold ${getLinkClass(
                    currentPage === "templates"
                  )}`}
                >
                  <FileText size={16} />
                  {t.nav.createCv}
                  <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                    {t.nav.free}
                  </span>
                </button>

                <button
                  onClick={() => router.push("/create/cover-letter")}
                  className={getLinkClass(false)}
                >
                  {t.nav.coverLetter}
                </button>

                <button
                  onClick={() => onNavigate("job-board")}
                  className={getLinkClass(currentPage === "job-board")}
                >
                  {t.nav.findJobs}
                </button>

                <button
                  onClick={() => onNavigate("courses")}
                  className={getLinkClass(currentPage === "courses")}
                >
                  {t.nav.courses}
                </button>

                <button
                  onClick={() => onNavigate("pricing")}
                  className={getLinkClass(currentPage === "pricing")}
                >
                  {t.nav.subscription}
                </button>

                <button
                  onClick={() => onNavigate("company")}
                  className={getLinkClass(currentPage === "company")}
                >
                  {t.nav.forCompanies}
                </button>
              </>
            )}
          </div>

          <div className="hidden md:flex flex-shrink-0 items-center gap-3 lg:gap-5">
            <LanguageToggle />
            {isCompany ? (
              <>
                <button
                  onClick={() => onNavigate("company")}
                  className={getLinkClass(currentPage === "company")}
                >
                  <BookOpen size={18} />
                  {t.nav.dashboard}
                </button>

                <button
                  onClick={() => onNavigate("company-profile")}
                  className={getLinkClass(currentPage === "company-profile")}
                >
                  <User size={18} />
                  {t.nav.profile}
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <LogOut size={18} />
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-foreground hover:text-[#088395] transition-colors font-medium">
                  {t.nav.account}
                  <ChevronDown size={16} />
                </button>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {isPro && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                      <div className="flex items-center gap-2">
                        <Crown size={14} className="text-yellow-500" />
                        <span className="text-sm font-semibold text-yellow-700">
                          {t.nav.proMember}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigate("dashboard")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <BookOpen size={16} />
                    {t.nav.dashboard}
                  </button>

                  <button
                    onClick={() => onNavigate("user-profile")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} />
                    {t.nav.profile}
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-50 transition-colors"
                  >
                    <LogOut size={16} />
                    {t.nav.logout}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="ml-auto md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t.nav.toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100">
            <div className="px-6 pb-2">
              <LanguageToggle compact />
            </div>
            {isCompany ? (
              <div className="flex flex-col px-2">
                <button
                  onClick={() => {
                    onNavigate("company");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 font-medium"
                >
                  <BookOpen size={20} className="text-[#088395]" />
                  {t.nav.dashboard}
                </button>

                <button
                  onClick={() => {
                    onNavigate("company-profile");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 font-medium"
                >
                  <User size={20} className="text-[#088395]" />
                  {t.nav.profile}
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 font-medium text-red-600"
                >
                  <LogOut size={20} />
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex flex-col px-2">
                <button
                  onClick={() => {
                    router.push("/templates/showcase");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <FileText size={20} className="text-[#088395]" />
                  {t.nav.createCv}
                </button>

                <button
                  onClick={() => {
                    router.push("/create/cover-letter");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <FileText size={20} className="text-[#088395]" />
                  {t.nav.coverLetter}
                </button>

                <button
                  onClick={() => {
                    onNavigate("job-board");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <Search size={20} className="text-[#088395]" />
                  {t.nav.findJobs}
                </button>

                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <BookOpen size={20} className="text-[#088395]" />
                  {t.nav.dashboard}
                </button>

                <button
                  onClick={() => {
                    onNavigate("user-profile");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <User size={20} className="text-[#088395]" />
                  {t.nav.profile}
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4 text-red-600"
                >
                  <LogOut size={20} />
                  {t.nav.logout}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
