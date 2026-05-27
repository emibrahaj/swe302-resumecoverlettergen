"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  Crown,
  FileText,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { api } from "@/src/lib/api";
import { useLanguage } from "@/src/context/LanguageContext";
import { LanguageToggle } from "@/src/components/figma/LanguageToggle";

interface JobNotification {
  id: string;
  match_score: number;
  created_at: string;
  job_posting: {
    id: string;
    job_title: string;
    company_name: string | null;
    job_location: string | null;
    employment_type: string | null;
  } | null;
}

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (isCompany) return;

    api
      .get<{ notifications: JobNotification[]; unread_count: number }>(
        "/job-alerts/notifications",
      )
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      })
      .catch(() => {
        // Notifications are optional; keep navigation usable if alerts fail.
      });
  }, [isCompany]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotifications = async () => {
    setNotifOpen((prev) => !prev);

    if (!notifOpen && unreadCount > 0) {
      try {
        await api.post("/job-alerts/mark-read");
        setUnreadCount(0);
      } catch {
        // If marking as read fails, leave the visible state unchanged.
      }
    }
  };

  const getLinkClass = (active: boolean) =>
    `whitespace-nowrap transition-colors font-medium ${
      active ? "text-[#088395]" : "text-foreground hover:text-[#088395]"
    }`;

  const closeMenuAndNavigate = (page: UserNavPage) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center gap-4 h-16">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3 lg:gap-5 xl:gap-7">
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

            {!isPro && (
              <button
                onClick={() => onNavigate("pricing")}
                className={getLinkClass(currentPage === "pricing")}
              >
                {t.nav.subscription}
              </button>
            )}

            <button
              onClick={() => onNavigate("company")}
              className={getLinkClass(currentPage === "company")}
            >
              {t.nav.forCompanies}
            </button>
          </div>

          <div className="hidden md:flex ml-auto flex-shrink-0 items-center gap-3 lg:gap-5">
            {!isCompany && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={openNotifications}
                  className="relative p-2 text-foreground hover:text-[#088395] transition-colors"
                  aria-label="Job alert notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        Job Alert Notifications
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-foreground/50">
                        <Bell size={28} className="mx-auto mb-2 opacity-30" />
                        No high-match jobs yet.
                        <p className="text-xs mt-1">
                          Enable alerts in the Find Jobs page.
                        </p>
                      </div>
                    ) : (
                      <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.map((notification) => (
                          <li
                            key={notification.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              onNavigate("job-board");
                              setNotifOpen(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 p-1.5 bg-[#088395]/10 rounded-lg shrink-0">
                                <Briefcase
                                  size={14}
                                  className="text-[#088395]"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {notification.job_posting?.job_title ??
                                    "Job Opening"}
                                </p>
                                {notification.job_posting?.company_name && (
                                  <p className="text-xs text-foreground/60 truncate">
                                    {notification.job_posting.company_name}
                                  </p>
                                )}
                                <span className="inline-block mt-1 text-[11px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  {Math.round(notification.match_score * 100)}%
                                  match
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate("job-board");
                          setNotifOpen(false);
                        }}
                        className="text-xs text-[#088395] hover:underline"
                      >
                        View all jobs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative group">
              <button className="flex items-center gap-1 px-4 py-2 text-foreground hover:text-[#088395] transition-colors font-medium">
                {t.nav.account}
                <ChevronDown size={16} />
              </button>

              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() =>
                    onNavigate(isCompany ? "company" : "dashboard")
                  }
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <BookOpen size={16} />
                  {t.nav.dashboard}
                </button>

                <button
                  onClick={() =>
                    onNavigate(isCompany ? "company-profile" : "user-profile")
                  }
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <User size={16} />
                  {t.nav.profile}
                </button>

                <div className="px-4 py-3 border-t border-gray-50">
                  <LanguageToggle compact />
                </div>

                <button
                  onClick={onLogout}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-50 transition-colors"
                >
                  <LogOut size={16} />
                  {t.nav.logout}
                </button>
              </div>
            </div>
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
            <div className="flex flex-col px-2">
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
                onClick={() => closeMenuAndNavigate("job-board")}
                className="flex items-center gap-3 py-3 px-4"
              >
                <Search size={20} className="text-[#088395]" />
                {t.nav.findJobs}
              </button>

              <button
                onClick={() => closeMenuAndNavigate("courses")}
                className="flex items-center gap-3 py-3 px-4"
              >
                <BookOpen size={20} className="text-[#088395]" />
                {t.nav.courses}
              </button>

              {!isPro && (
                <button
                  onClick={() => closeMenuAndNavigate("pricing")}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <Crown size={20} className="text-[#088395]" />
                  {t.nav.subscription}
                </button>
              )}

              <button
                onClick={() => closeMenuAndNavigate("company")}
                className="flex items-center gap-3 py-3 px-4"
              >
                <Briefcase size={20} className="text-[#088395]" />
                {t.nav.forCompanies}
              </button>

              <button
                onClick={() =>
                  closeMenuAndNavigate(isCompany ? "company" : "dashboard")
                }
                className="flex items-center gap-3 py-3 px-4"
              >
                <BookOpen size={20} className="text-[#088395]" />
                {t.nav.dashboard}
              </button>

              <button
                onClick={() =>
                  closeMenuAndNavigate(
                    isCompany ? "company-profile" : "user-profile",
                  )
                }
                className="flex items-center gap-3 py-3 px-4"
              >
                <User size={20} className="text-[#088395]" />
                {t.nav.profile}
              </button>

              <div className="px-4 py-3">
                <LanguageToggle compact />
              </div>

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
          </div>
        )}
      </div>
    </nav>
  );
}