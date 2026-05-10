"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookiePolicyModal({ isOpen, onClose }: CookiePolicyModalProps) {
  const [activeTab, setActiveTab] = useState<"consent" | "details" | "about">(
    "consent"
  );

  const [openSections, setOpenSections] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab("consent");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAccept = () => {
    localStorage.setItem("wirehire_cookie_consent", "accepted");
    onClose();
  };

  const handleDeny = () => {
    localStorage.setItem("wirehire_cookie_consent", "denied");
    onClose();
  };

  const isLarge = activeTab === "details" || activeTab === "about";

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div
        className={`bg-white w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all ${
          isLarge ? "max-w-4xl max-h-[85vh]" : "max-w-3xl"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="grid grid-cols-3 flex-1">
            <button
              type="button"
              onClick={() => setActiveTab("consent")}
              className={`py-4 font-semibold transition-colors ${
                activeTab === "consent"
                  ? "text-[#088395] border-b-2 border-[#088395]"
                  : "text-gray-700 hover:text-[#088395]"
              }`}
            >
              Consent
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`py-4 font-semibold transition-colors ${
                activeTab === "details"
                  ? "text-[#088395] border-b-2 border-[#088395]"
                  : "text-gray-700 hover:text-[#088395]"
              }`}
            >
              Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`py-4 font-semibold transition-colors ${
                activeTab === "about"
                  ? "text-[#088395] border-b-2 border-[#088395]"
                  : "text-gray-700 hover:text-[#088395]"
              }`}
            >
              About
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cookie policy"
            className="mr-4 w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className={`${isLarge ? "max-h-[58vh] overflow-y-auto" : ""}`}>
          {activeTab === "consent" && (
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                This website uses cookies
              </h2>

              <p className="text-gray-700 leading-relaxed">
                We use cookies to improve your experience, remember your
                preferences, analyse website traffic, and support important
                platform features. Some cookies are necessary for the website to
                work properly, while others help us improve WireHire.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="mt-3 text-[#088395] font-semibold underline underline-offset-4 hover:text-[#066c7a]"
              >
                Show details
              </button>
            </div>
          )}

          {activeTab === "details" && (
            <div className="p-6 sm:p-8 space-y-5">
              <CookieSection
                title="Necessary"
                count={8}
                isOpen={openSections.necessary}
                onClick={() => toggleSection("necessary")}
              >
                Necessary cookies help make the website usable by enabling basic
                functions like page navigation, secure login, account access,
                and resume editing. The website cannot function properly without
                these cookies.
              </CookieSection>

              <CookieSection
                title="Preferences"
                count={3}
                isOpen={openSections.preferences}
                onClick={() => toggleSection("preferences")}
              >
                Preference cookies allow WireHire to remember choices you make,
                such as selected templates, interface preferences, and saved
                user settings.
              </CookieSection>

              <CookieSection
                title="Statistics"
                count={5}
                isOpen={openSections.statistics}
                onClick={() => toggleSection("statistics")}
              >
                Statistics cookies help us understand how visitors interact with
                the platform by collecting anonymous information about page
                visits, feature usage, and performance.
              </CookieSection>

              <CookieSection
                title="Marketing"
                count={4}
                isOpen={openSections.marketing}
                onClick={() => toggleSection("marketing")}
              >
                Marketing cookies may be used to understand campaign
                performance and show users more relevant content or promotions.
              </CookieSection>
            </div>
          )}

          {activeTab === "about" && (
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                About cookies
              </h2>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Cookies are small text files stored on your device when you
                  visit a website. They help websites remember information about
                  your visit and make the experience more useful.
                </p>

                <p>
                  WireHire uses cookies to support secure login, remember user
                  preferences, improve performance, and understand how our
                  platform is used.
                </p>

                <p>
                  You can manage or disable cookies through your browser
                  settings. However, disabling necessary cookies may affect how
                  the website works.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 justify-end bg-white">
          <button
  type="button"
  onClick={handleDeny}
  className="px-8 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 bg-white min-w-[140px]
             shadow-sm transition-all duration-200 ease-in-out
             hover:bg-gray-100 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5
             active:bg-gray-200 active:translate-y-0 active:scale-95"
>
  Deny
</button>

        <button
  type="button"
  onClick={handleAccept}
  className="px-8 py-3 bg-[#088395] text-white rounded-full font-semibold min-w-[140px]
             shadow-md transition-all duration-200 ease-in-out
             hover:bg-[#066c7a] hover:shadow-xl hover:-translate-y-0.5
             active:bg-[#055866] active:translate-y-0 active:scale-95"
>
  Allow all
</button>
        </div>
      </div>
    </div>
  );
}

interface CookieSectionProps {
  title: string;
  count: number;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function CookieSection({
  title,
  count,
  isOpen,
  onClick,
  children,
}: CookieSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-5">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 text-left"
      >
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}

        <span className="font-bold text-gray-900">{title}</span>

        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
          {count}
        </span>
      </button>

      {isOpen && (
        <p className="mt-4 pl-8 text-gray-700 leading-relaxed">{children}</p>
      )}
    </div>
  );
}