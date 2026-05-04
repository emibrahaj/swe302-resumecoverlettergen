"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Briefcase, CreditCard, FileText } from "lucide-react";

interface PublicUserNavProps {
  currentPage?: "templates" | "courses" | "pricing" | "job-board";
}

export function PublicUserNav({ currentPage }: PublicUserNavProps) {
  const router = useRouter();

  const getLinkClass = (
    page: "templates" | "courses" | "pricing" | "job-board"
  ) => {
    return `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      currentPage === page
        ? "bg-[#088395]/10 text-[#088395]"
        : "text-foreground/70 hover:text-foreground"
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-[#088395]"
          >
            WireHire
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push("/templates/showcase?from=home")}
              className={getLinkClass("templates")}
            >
              <FileText size={18} />
              Templates
            </button>

            <button
              onClick={() => router.push("/courses?from=public")}
              className={getLinkClass("courses")}
            >
              <BookOpen size={18} />
              Courses
            </button>

            <button
              onClick={() => router.push("/pricing")}
              className={getLinkClass("pricing")}
            >
              <CreditCard size={18} />
              Pricing
            </button>

            <button
              onClick={() => router.push("/job-board?from=public")}
              className={getLinkClass("job-board")}
            >
              <Briefcase size={18} />
              Find Jobs
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}