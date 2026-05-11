"use client";

import { useState } from "react";
import { ChevronDown, Crown, LogOut, Menu, User, X } from "lucide-react";

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
    `transition-colors ${
      active ? "text-[#088395]" : "text-foreground hover:text-foreground"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center cursor-pointer"
          >
             <img src="/DiversiHire1.png" alt="DiversiHire" className="h-38 w-auto" />
          </button>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {!isCompany ? (
              <>
                <button
                  onClick={() => onNavigate("templates")}
                  className={getLinkClass(currentPage === "templates")}
                >
                  Cover Letter
                </button>

                <button
                  onClick={() => onNavigate("job-board")}
                  className={getLinkClass(currentPage === "job-board")}
                >
                  Find Jobs
                </button>

                <button
                  onClick={() => onNavigate("courses")}
                  className={getLinkClass(currentPage === "courses")}
                >
                  Courses
                </button>

                <button
                  onClick={() => onNavigate("pricing")}
                  className={getLinkClass(currentPage === "pricing")}
                >
                  Pricing
                </button>

                <button
                  onClick={() => onNavigate("company")}
                  className={getLinkClass(currentPage === "company")}
                >
                  For Companies
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("company")}
                  className={getLinkClass(currentPage === "company")}
                >
                  For Companies
                </button>

                <button
                  onClick={() => onNavigate("pricing")}
                  className={getLinkClass(currentPage === "pricing")}
                >
                  Pricing
                </button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-1 px-4 py-2 text-foreground hover:text-[#088395] transition-colors">
                Account
                <ChevronDown size={16} />
              </button>

              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {isPro && (
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <Crown size={14} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-yellow-700">
                        Pro Member
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600/70 mt-0.5">
                      All features unlocked
                    </p>
                  </div>
                )}

                <button
                  onClick={() =>
                    onNavigate(isCompany ? "company-profile" : "user-profile")
                  }
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

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {!isCompany ? (
              <>
                <button
                  onClick={() => {
                    onNavigate("templates");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  Cover Letter
                </button>

                <button
                  onClick={() => {
                    onNavigate("job-board");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  Find Jobs
                </button>

                <button
                  onClick={() => {
                    onNavigate("courses");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  Courses
                </button>

                <button
                  onClick={() => {
                    onNavigate("pricing");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  Pricing
                </button>

                <button
                  onClick={() => {
                    onNavigate("company");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  For Companies
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate("company");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  For Companies
                </button>

                <button
                  onClick={() => {
                    onNavigate("pricing");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground/70 hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
              </>
            )}

            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  onNavigate(isCompany ? "company-profile" : "user-profile");
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-foreground border border-border rounded-lg text-left"
              >
                Profile
              </button>


              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-red-600 border border-border rounded-lg text-left"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}