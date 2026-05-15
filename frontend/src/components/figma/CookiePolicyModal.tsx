"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Language = "sq" | "en";
type CookieCategory = "necessary" | "preferences" | "statistics" | "marketing";
type OptionalCookieCategory = Exclude<CookieCategory, "necessary">;

interface CookieConsentSettings {
  necessary: true;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
  savedAt: string;
  version: string;
}

const CONSENT_STORAGE_KEY = "diversihire_cookie_consent";
const CONSENT_VERSION = "1.0";

const defaultConsent: CookieConsentSettings = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
  savedAt: "",
  version: CONSENT_VERSION,
};

const text = {
  sq: {
    tabs: {
      consent: "Pëlqimi",
      details: "Detajet",
      about: "Rreth cookies",
    },
    closeLabel: "Mbyll politikën e cookies",
    title: "Kjo faqe përdor cookies",
    intro:
      "DiversiHire përdor cookies të domosdoshme për funksionimin e faqes, si hyrja e sigurt, ruajtja e sesionit dhe funksionet bazë të platformës. Me pëlqimin tuaj, mund të përdorim edhe cookies opsionale për preferenca, statistika dhe marketing.",
    legal:
      "Cookies jo të domosdoshme aktivizohen vetëm nëse jepni pëlqimin tuaj. Ju mund ta ndryshoni ose tërhiqni pëlqimin në çdo kohë nga ky panel ose nga cilësimet e shfletuesit.",
    showDetails: "Shfaq detajet",
    aboutTitle: "Rreth cookies",
    aboutParagraphs: [
      "Cookies janë skedarë të vegjël teksti që ruhen në pajisjen tuaj kur vizitoni një faqe interneti. Ato ndihmojnë faqen të kujtojë informacion për vizitën tuaj dhe të funksionojë më mirë.",
      "Sipas parimeve të Ligjit nr. 124/2024 për mbrojtjen e të dhënave personale, ne përdorim cookies në mënyrë transparente, vetëm për qëllime të përcaktuara dhe, për cookies jo të domosdoshme, vetëm me pëlqimin tuaj.",
      "Çaktivizimi i cookies të domosdoshme mund të ndikojë në hyrjen në llogari, sigurinë dhe funksionimin bazë të platformës. Cookies opsionale mund të refuzohen pa penguar përdorimin kryesor të faqes.",
    ],
    categories: {
      necessary: {
        title: "Të domosdoshme",
        label: "Gjithmonë aktive",
        description:
          "Këto cookies janë të nevojshme për funksionimin e faqes, duke përfshirë navigimin, hyrjen e sigurt, ruajtjen e sesionit, mbrojtjen kundër abuzimit dhe funksionet bazë të CV-së. Nuk mund të çaktivizohen nga ky panel.",
      },
      preferences: {
        title: "Preferenca",
        label: "Opsionale",
        description:
          "Këto cookies ruajnë zgjedhjet tuaja, si gjuha, preferencat e ndërfaqes, tema vizuale ose opsione të ngjashme që e bëjnë platformën më të përshtatshme për ju.",
      },
      statistics: {
        title: "Statistika",
        label: "Opsionale",
        description:
          "Këto cookies na ndihmojnë të kuptojmë në mënyrë të agreguar se si përdoret faqja, cilat funksione përdoren më shpesh dhe si mund të përmirësojmë performancën. Ato duhet të përdoren vetëm pas pëlqimit tuaj.",
      },
      marketing: {
        title: "Marketing",
        label: "Opsionale",
        description:
          "Këto cookies mund të përdoren për të matur efektivitetin e fushatave ose për të shfaqur përmbajtje më të përshtatshme promocionale. Ato aktivizohen vetëm nëse jepni pëlqimin tuaj.",
      },
    },
    buttons: {
      deny: "Refuzo opsionalet",
      selected: "Ruaj zgjedhjet",
      allow: "Prano të gjitha",
    },
  },
  en: {
    tabs: {
      consent: "Consent",
      details: "Details",
      about: "About cookies",
    },
    closeLabel: "Close cookie policy",
    title: "This website uses cookies",
    intro:
      "DiversiHire uses necessary cookies to make the website work, including secure login, session storage, and core platform features. With your consent, we may also use optional cookies for preferences, statistics, and marketing.",
    legal:
      "Non-essential cookies are enabled only if you give consent. You can change or withdraw your consent at any time from this panel or through your browser settings.",
    showDetails: "Show details",
    aboutTitle: "About cookies",
    aboutParagraphs: [
      "Cookies are small text files stored on your device when you visit a website. They help the website remember information about your visit and work more reliably.",
      "In line with the principles of Albanian Law No. 124/2024 on personal data protection, we use cookies transparently, only for specific purposes and, for non-essential cookies, only with your consent.",
      "Disabling necessary cookies may affect account login, security, and basic platform functionality. Optional cookies can be refused without blocking the main use of the website.",
    ],
    categories: {
      necessary: {
        title: "Necessary",
        label: "Always active",
        description:
          "These cookies are required for the website to function, including navigation, secure login, session storage, abuse prevention, and core resume features. They cannot be disabled from this panel.",
      },
      preferences: {
        title: "Preferences",
        label: "Optional",
        description:
          "These cookies remember your choices, such as language, interface preferences, visual theme, or similar settings that make the platform more convenient for you.",
      },
      statistics: {
        title: "Statistics",
        label: "Optional",
        description:
          "These cookies help us understand in aggregate how the website is used, which features are used most often, and how we can improve performance. They should only be used after your consent.",
      },
      marketing: {
        title: "Marketing",
        label: "Optional",
        description:
          "These cookies may be used to measure campaign effectiveness or show more relevant promotional content. They are enabled only if you give consent.",
      },
    },
    buttons: {
      deny: "Reject optional",
      selected: "Save choices",
      allow: "Allow all",
    },
  },
};

export function CookiePolicyModal({ isOpen, onClose }: CookiePolicyModalProps) {
  const [language, setLanguage] = useState<Language>("sq");
  const [activeTab, setActiveTab] = useState<"consent" | "details" | "about">(
    "consent"
  );
  const [consent, setConsent] = useState<CookieConsentSettings>(defaultConsent);
  const [openSections, setOpenSections] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("consent");

    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as Partial<CookieConsentSettings>;
      setConsent({
        necessary: true,
        preferences: Boolean(parsed.preferences),
        statistics: Boolean(parsed.statistics),
        marketing: Boolean(parsed.marketing),
        savedAt: parsed.savedAt ?? "",
        version: parsed.version ?? CONSENT_VERSION,
      });
    } catch {
      setConsent(defaultConsent);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = text[language];
  const isLarge = activeTab === "details" || activeTab === "about";

  const toggleSection = (section: CookieCategory) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleConsent = (category: OptionalCookieCategory) => {
    setConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const saveConsent = (settings: Omit<CookieConsentSettings, "savedAt" | "version">) => {
    const consentToSave: CookieConsentSettings = {
      ...settings,
      necessary: true,
      savedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentToSave));
    window.dispatchEvent(
      new CustomEvent("diversihire-cookie-consent-updated", {
        detail: consentToSave,
      })
    );
    onClose();
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
    });
  };

  const handleRejectOptional = () => {
    saveConsent({
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
    });
  };

  const handleSaveSelected = () => {
    saveConsent({
      necessary: true,
      preferences: consent.preferences,
      statistics: consent.statistics,
      marketing: consent.marketing,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-policy-title"
        className={`bg-white w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all ${
          isLarge ? "max-w-4xl max-h-[85vh]" : "max-w-3xl"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="grid grid-cols-3 flex-1">
            <TabButton active={activeTab === "consent"} onClick={() => setActiveTab("consent")}>
              {t.tabs.consent}
            </TabButton>
            <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>
              {t.tabs.details}
            </TabButton>
            <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")}>
              {t.tabs.about}
            </TabButton>
          </div>

          <div className="hidden sm:flex items-center gap-2 mr-3">
            <LanguageButton active={language === "sq"} onClick={() => setLanguage("sq")}>
              Shqip
            </LanguageButton>
            <LanguageButton active={language === "en"} onClick={() => setLanguage("en")}>
              EN
            </LanguageButton>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="mr-4 w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sm:hidden flex items-center gap-2 px-5 pt-4">
          <LanguageButton active={language === "sq"} onClick={() => setLanguage("sq")}>
            Shqip
          </LanguageButton>
          <LanguageButton active={language === "en"} onClick={() => setLanguage("en")}>
            EN
          </LanguageButton>
        </div>

        <div className={`${isLarge ? "max-h-[58vh] overflow-y-auto" : ""}`}>
          {activeTab === "consent" && (
            <div className="p-6 sm:p-8">
              <h2 id="cookie-policy-title" className="text-2xl font-bold mb-4 text-gray-900">
                {t.title}
              </h2>

              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>{t.intro}</p>
                <p>{t.legal}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="mt-4 text-[#088395] font-semibold underline underline-offset-4 hover:text-[#066c7a]"
              >
                {t.showDetails}
              </button>
            </div>
          )}

          {activeTab === "details" && (
            <div className="p-6 sm:p-8 space-y-5">
              <CookieSection
                title={t.categories.necessary.title}
                badge={t.categories.necessary.label}
                isOpen={openSections.necessary}
                onClick={() => toggleSection("necessary")}
              >
                {t.categories.necessary.description}
              </CookieSection>

              <CookieSection
                title={t.categories.preferences.title}
                badge={t.categories.preferences.label}
                isOpen={openSections.preferences}
                onClick={() => toggleSection("preferences")}
                enabled={consent.preferences}
                onToggle={() => toggleConsent("preferences")}
              >
                {t.categories.preferences.description}
              </CookieSection>

              <CookieSection
                title={t.categories.statistics.title}
                badge={t.categories.statistics.label}
                isOpen={openSections.statistics}
                onClick={() => toggleSection("statistics")}
                enabled={consent.statistics}
                onToggle={() => toggleConsent("statistics")}
              >
                {t.categories.statistics.description}
              </CookieSection>

              <CookieSection
                title={t.categories.marketing.title}
                badge={t.categories.marketing.label}
                isOpen={openSections.marketing}
                onClick={() => toggleSection("marketing")}
                enabled={consent.marketing}
                onToggle={() => toggleConsent("marketing")}
              >
                {t.categories.marketing.description}
              </CookieSection>
            </div>
          )}

          {activeTab === "about" && (
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{t.aboutTitle}</h2>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                {t.aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 justify-end bg-white">
          <button
            type="button"
            onClick={handleRejectOptional}
            className="px-8 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 bg-white min-w-[160px] shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-100 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 active:bg-gray-200 active:translate-y-0 active:scale-95"
          >
            {t.buttons.deny}
          </button>

          <button
            type="button"
            onClick={handleSaveSelected}
            className="px-8 py-3 border border-[#088395] text-[#088395] rounded-full font-semibold bg-white min-w-[160px] shadow-sm transition-all duration-200 ease-in-out hover:bg-[#e9fbfd] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            {t.buttons.selected}
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-8 py-3 bg-[#088395] text-white rounded-full font-semibold min-w-[160px] shadow-md transition-all duration-200 ease-in-out hover:bg-[#066c7a] hover:shadow-xl hover:-translate-y-0.5 active:bg-[#055866] active:translate-y-0 active:scale-95"
          >
            {t.buttons.allow}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-4 px-2 text-sm sm:text-base font-semibold transition-colors ${
        active
          ? "text-[#088395] border-b-2 border-[#088395]"
          : "text-gray-700 hover:text-[#088395]"
      }`}
    >
      {children}
    </button>
  );
}

interface LanguageButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function LanguageButton({ active, onClick, children }: LanguageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
        active
          ? "bg-[#088395] text-white border-[#088395]"
          : "bg-white text-gray-700 border-gray-300 hover:border-[#088395] hover:text-[#088395]"
      }`}
    >
      {children}
    </button>
  );
}

interface CookieSectionProps {
  title: string;
  badge: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  enabled?: boolean;
  onToggle?: () => void;
}

function CookieSection({
  title,
  badge,
  isOpen,
  onClick,
  children,
  enabled,
  onToggle,
}: CookieSectionProps) {
  const hasToggle = typeof enabled === "boolean" && Boolean(onToggle);

  return (
    <div className="border-b border-gray-200 pb-5">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onClick} className="flex items-center gap-3 text-left">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}

          <span className="font-bold text-gray-900">{title}</span>

          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            {badge}
          </span>
        </button>

        {hasToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              enabled ? "bg-[#088395]" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>

      {isOpen && <p className="mt-4 pl-8 text-gray-700 leading-relaxed">{children}</p>}
    </div>
  );
}
