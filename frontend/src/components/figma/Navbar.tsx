"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Menu, X } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { LanguageToggle } from "@/src/components/figma/LanguageToggle";

type NavbarPage = "templates" | "courses" | "pricing" | "job-board";

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  currentPage?: NavbarPage;
  onPricingClick?: () => void;
  onCompanyClick?: () => void;
  onJobsClick?: () => void;
  onCoursesClick?: () => void;
  onCoverLetterClick?: () => void;
}

export function Navbar({
  onLoginClick,
  onSignupClick,
  currentPage,
  onPricingClick,
  onCompanyClick,
  onJobsClick,
  onCoursesClick,
  onCoverLetterClick,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const getLinkClass = (page: NavbarPage) =>
    `whitespace-nowrap transition-colors ${
      currentPage === page
        ? "text-[#088395] font-semibold"
        : "text-foreground hover:text-[#088395]"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center gap-4 h-16">
          <div className="flex min-w-0 flex-shrink-0 items-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center cursor-pointer focus:outline-none"
              aria-label={t.nav.home}
            >
              <img
                src="/DiversiHire1.png"
                alt="DiversiHire"
                className="h-38 w-auto"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3 lg:gap-5 xl:gap-7">
            {onCoverLetterClick && (
              <button
                onClick={onCoverLetterClick}
                className="whitespace-nowrap text-foreground hover:text-[#088395] transition-colors"
              >
                {t.nav.coverLetter}
              </button>
            )}

            {onJobsClick && (
              <button onClick={onJobsClick} className={getLinkClass("job-board")}>
                {t.nav.findJobs}
              </button>
            )}

            {onCoursesClick && (
              <button onClick={onCoursesClick} className={getLinkClass("courses")}>
                {t.nav.courses}
              </button>
            )}

            {onPricingClick ? (
              <button onClick={onPricingClick} className={getLinkClass("pricing")}>
                {t.nav.subscription}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={getLinkClass("pricing")}
              >
                {t.nav.subscription}
              </button>
            )}

            {onCompanyClick && (
              <button
                onClick={onCompanyClick}
                className="whitespace-nowrap text-foreground hover:text-[#088395] transition-colors"
              >
                {t.nav.forCompanies}
              </button>
            )}
          </div>

          <div className="hidden md:flex ml-auto flex-shrink-0 items-center gap-2 lg:gap-4">
            <LanguageToggle />

            <button
              onClick={onLoginClick}
              className="whitespace-nowrap px-3 py-2 text-foreground hover:text-[#088395] transition-colors lg:px-4"
            >
              {t.nav.login}
            </button>

            <button
              onClick={onSignupClick}
              className="whitespace-nowrap px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all lg:px-6"
            >
              {t.nav.signup}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="ml-auto p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
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
              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                {t.nav.free}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.features}
            </button>

            {onCoverLetterClick && (
              <button
                onClick={() => {
                  onCoverLetterClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
              >
                {t.nav.coverLetter}
              </button>
            )}

            {onJobsClick && (
              <button
                onClick={() => {
                  onJobsClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
              >
                {t.nav.findJobs}
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
                {t.nav.courses}
              </button>
            )}

            {onPricingClick ? (
              <button
                onClick={() => {
                  onPricingClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
              >
                {t.nav.subscription}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
              >
                {t.nav.subscription}
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
                {t.nav.forCompanies}
              </button>
            )}

            <div className="flex flex-col gap-2 pt-4">
              <LanguageToggle compact />

              <button
                onClick={() => {
                  onLoginClick();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-foreground border border-border rounded-lg"
              >
                {t.nav.login}
              </button>

              <button
                onClick={() => {
                  onSignupClick();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 bg-[#088395] text-white rounded-lg"
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