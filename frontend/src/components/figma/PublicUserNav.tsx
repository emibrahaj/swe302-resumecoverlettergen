"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Menu, X } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { LanguageToggle } from "@/src/components/figma/LanguageToggle";

type NavPage = "create-cv" | "templates" | "courses" | "pricing" | "job-board" | "cover-letter";

interface PublicUserNavProps {
  currentPage?: NavPage;
  onBack?: () => void;
}

export function PublicUserNav({ currentPage, onBack }: PublicUserNavProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const getLinkClass = (page: NavPage) =>
    `transition-colors ${
      currentPage === page
        ? "text-[#088395]"
        : "text-foreground hover:text-[#088395]"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          <div className="flex min-w-0 flex-shrink-0 items-center gap-2">
            {onBack && currentPage !== "job-board" && currentPage !== "courses" && (
  <button
    onClick={onBack}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
    aria-label={t.nav.back}
  >
    <ArrowLeft size={22} />
  </button>
)}

            <button
              onClick={() => router.push("/")}
              className="flex items-center"
              aria-label={t.nav.home}
            >
              <img src="/DiversiHire1.png" alt="DiversiHire" className="h-38 w-auto" />
            </button>
          </div>

          <div className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-3 lg:gap-5 xl:gap-7">
            <button
              onClick={() => router.push("/templates/showcase")}
              className={`flex items-center gap-1.5 whitespace-nowrap font-semibold ${getLinkClass("create-cv")}`}
            >
              <FileText size={16} />
              {t.nav.createCv}
              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">{t.nav.free}</span>
            </button>

            <button
              onClick={() => router.push("/create/cover-letter")}
              className={`whitespace-nowrap ${getLinkClass("cover-letter")}`}
            >
              {t.nav.coverLetter}
            </button>

            <button
              onClick={() => router.push("/job-board")}
              className={`whitespace-nowrap ${getLinkClass("job-board")}`}
            >
              {t.nav.findJobs}
            </button>

            <button
              onClick={() => router.push("/courses")}
              className={`whitespace-nowrap ${getLinkClass("courses")}`}
            >
              {t.nav.courses}
            </button>

            <button
              onClick={() => router.push("/pricing")}
              className={`whitespace-nowrap ${getLinkClass("pricing")}`}
            >
              {t.nav.subscription}
            </button>

            <button
              onClick={() => router.push("/company/login")}
              className="whitespace-nowrap transition-colors text-foreground hover:text-[#088395]"
            >
              {t.nav.forCompanies}
            </button>
          </div>

          <div className="hidden md:flex flex-shrink-0 items-center gap-2 lg:gap-4">
            <LanguageToggle />
            <button
              onClick={() => router.push("/login")}
              className="whitespace-nowrap px-3 py-2 text-foreground hover:text-[#088395] transition-colors lg:px-4"
            >
              {t.nav.login}
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="whitespace-nowrap px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all lg:px-6"
            >
              {t.nav.signup}
            </button>
          </div>

          <button
            className="ml-auto md:hidden p-2"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={t.nav.toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button
              onClick={() => {
                router.push("/templates/showcase");
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left font-semibold text-foreground hover:text-[#088395] transition-colors"
            >
              <FileText size={16} />
              {t.nav.createCv}
              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">{t.nav.free}</span>
            </button>

            <button
              onClick={() => {
                router.push("/create/cover-letter");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.coverLetter}
            </button>

            <button
              onClick={() => {
                router.push("/job-board");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.findJobs}
            </button>

            <button
              onClick={() => {
                router.push("/courses");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.courses}
            </button>

            <button
              onClick={() => {
                router.push("/pricing");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.subscription}
            </button>

            <button
              onClick={() => {
                router.push("/company/login");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.forCompanies}
            </button>

            <div className="flex flex-col gap-3 pt-4">
              <LanguageToggle compact />
              <button
                onClick={() => {
                  router.push("/login");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 border border-border rounded-lg"
              >
                {t.nav.login}
              </button>

              <button
                onClick={() => {
                  router.push("/signup");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 bg-[#088395] text-white rounded-lg"
              >
                {t.nav.signup}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
