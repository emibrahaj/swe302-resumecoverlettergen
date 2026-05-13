"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Menu, X } from "lucide-react";

type NavPage = "create-cv" | "templates" | "courses" | "pricing" | "job-board" | "cover-letter";

interface PublicUserNavProps {
  currentPage?: NavPage;
  onBack?: () => void;
}

export function PublicUserNav({ currentPage, onBack }: PublicUserNavProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getLinkClass = (page: NavPage) =>
    `transition-colors ${
      currentPage === page
        ? "text-[#088395]"
        : "text-foreground hover:text-[#088395]"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {onBack && currentPage !== "job-board" && currentPage !== "courses" && (
  <button
    onClick={onBack}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
    aria-label="Go back"
  >
    <ArrowLeft size={22} />
  </button>
)}

            <button
              onClick={() => router.push("/")}
              className="flex items-center"
              aria-label="Go to homepage"
            >
              <img src="/DiversiHire1.png" alt="DiversiHire" className="h-38 w-auto" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => router.push("/templates/showcase")}
              className={`flex items-center gap-1.5 font-semibold ${getLinkClass("create-cv")}`}
            >
              <FileText size={16} />
              Create CV
              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">FREE</span>
            </button>

            <button
              onClick={() => router.push("/create/cover-letter")}
              className={getLinkClass("cover-letter")}
            >
              Cover Letter
            </button>

            <button
              onClick={() => router.push("/job-board")}
              className={getLinkClass("job-board")}
            >
              Find Jobs
            </button>

            <button
              onClick={() => router.push("/courses")}
              className={getLinkClass("courses")}
            >
              Courses
            </button>

            <button
              onClick={() => router.push("/pricing")}
              className={getLinkClass("pricing")}
            >
              Subscription
            </button>

            <button
              onClick={() => router.push("/company/login")}
              className="transition-colors text-foreground hover:text-[#088395]"
            >
              For Companies
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-foreground hover:text-[#088395] transition-colors"
            >
              Log In
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="px-6 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Sign Up
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
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
              Create CV
              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">FREE</span>
            </button>

            <button
              onClick={() => {
                router.push("/create/cover-letter");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              Cover Letter
            </button>

            <button
              onClick={() => {
                router.push("/job-board");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              Find Jobs
            </button>

            <button
              onClick={() => {
                router.push("/courses");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              Courses
            </button>

            <button
              onClick={() => {
                router.push("/pricing");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              Subscription
            </button>

            <button
              onClick={() => {
                router.push("/company/login");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
            >
              For Companies
            </button>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => {
                  router.push("/login");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 border border-border rounded-lg"
              >
                Log In
              </button>

              <button
                onClick={() => {
                  router.push("/signup");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 bg-[#088395] text-white rounded-lg"
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