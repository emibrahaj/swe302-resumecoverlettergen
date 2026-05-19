"use client";

import { useEffect } from "react";
import { X, ShieldCheck, Lock, Cookie } from "lucide-react";
import { type Language, useLanguage } from "@/src/context/LanguageContext";

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CookieConsentSettings {
  necessary: true;
  savedAt: string;
  version: string;
}

const CONSENT_STORAGE_KEY = "diversihire_cookie_consent";
const CONSENT_VERSION = "2.0";

const text: Record<
  Language,
  {
    closeLabel: string;
    eyebrow: string;
    title: string;
    intro: string;
    mainInfo: string;
    legalNote: string;
    whatWeUseTitle: string;
    whatWeUseItems: {
      icon: "cookie" | "lock" | "shield";
      title: string;
      description: string;
    }[];
    browserTitle: string;
    browserText: string;
    button: string;
  }
> = {
  sq: {
    closeLabel: "Mbyll politikën e cookies",
    eyebrow: "Cookies",
    title: "Ne përdorim vetëm cookies të domosdoshme",
    intro:
      "DiversiHire përdor vetëm cookies që janë të nevojshme për funksionimin bazë dhe të sigurt të platformës.",
    mainInfo:
      "Këto cookies ndihmojnë faqen të mbajë sesionin tuaj aktiv, të ruajë zgjedhje bazë të ndërfaqes dhe të mbrojë platformën nga përdorimi i paautorizuar. Ato nuk përdoren për reklama, marketing, gjurmim të sjelljes ose analiza opsionale.",
    legalNote:
      "Këto cookies janë të domosdoshme, prandaj nuk mund të çaktivizohen nga ky panel. Mund t’i menaxhoni nga shfletuesi, por disa funksione mund të mos punojnë siç duhet.",
    whatWeUseTitle: "Për çfarë përdoren",
    whatWeUseItems: [
      {
        icon: "lock",
        title: "Hyrje e sigurt",
        description:
          "Mbajnë llogarinë dhe sesionin tuaj të sigurt gjatë përdorimit të platformës.",
      },
      {
        icon: "cookie",
        title: "Preferenca bazë",
        description:
          "Kujtojnë zgjedhje të nevojshme, si pëlqimi për cookies ose gjuha.",
      },
      {
        icon: "shield",
        title: "Siguri",
        description:
          "Ndihmojnë në mbrojtjen kundër abuzimit dhe aksesit të paautorizuar.",
      },
    ],
    browserTitle: "Kontrolli nga shfletuesi",
    browserText:
      "Mund t’i fshini ose bllokoni cookies nga cilësimet e shfletuesit, por kjo mund të ndikojë në hyrjen në llogari dhe funksionet bazë.",
    button: "E kuptova",
  },
  en: {
    closeLabel: "Close cookie policy",
    eyebrow: "Cookies",
    title: "We only use necessary cookies",
    intro:
      "DiversiHire uses only cookies required for the basic and secure operation of the platform.",
    mainInfo:
      "These cookies help keep your session active, remember essential interface choices, and protect the platform from unauthorized use. They are not used for advertising, marketing, behavioral tracking, or optional analytics.",
    legalNote:
      "These cookies are necessary, so they cannot be disabled from this panel. You can manage them through your browser, but some features may not work correctly.",
    whatWeUseTitle: "What they are used for",
    whatWeUseItems: [
      {
        icon: "lock",
        title: "Secure login",
        description:
          "Keep your account and session secure while using the platform.",
      },
      {
        icon: "cookie",
        title: "Basic preferences",
        description:
          "Remember essential choices, such as cookie acknowledgement or language.",
      },
      {
        icon: "shield",
        title: "Security",
        description:
          "Help protect against abuse and unauthorized access.",
      },
    ],
    browserTitle: "Browser control",
    browserText:
      "You can delete or block cookies from your browser settings, but this may affect login and core features.",
    button: "Got it",
  },
};

function getIcon(icon: "cookie" | "lock" | "shield") {
  if (icon === "lock") return <Lock size={17} />;
  if (icon === "shield") return <ShieldCheck size={17} />;
  return <Cookie size={17} />;
}

export function CookiePolicyModal({ isOpen, onClose }: CookiePolicyModalProps) {
  const { language } = useLanguage();
  const t = text[language];

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const saveAcknowledgement = () => {
    const consentToSave: CookieConsentSettings = {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-policy-title"
        className="relative w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-2xl"
      >
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#088395]/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#35a9b5]/10 blur-3xl" />

        <div className="relative border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-[#e6f7f9] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#088395]">
                {t.eyebrow}
              </span>

              <h2
                id="cookie-policy-title"
                className="mt-3 text-xl font-bold leading-tight tracking-tight text-gray-950 sm:text-2xl"
              >
                {t.title}
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
                {t.intro}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeLabel}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-950"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative max-h-[50vh] overflow-y-auto px-5 py-4 sm:px-6">
          <div className="rounded-2xl border border-[#d8eef1] bg-[#f7fbfc] p-4">
            <p className="text-sm leading-6 text-gray-700">{t.mainInfo}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-gray-950">
              {t.whatWeUseTitle}
            </h3>

            <div className="mt-3 grid gap-2">
              {t.whatWeUseItems.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f9] text-[#088395]">
                    {getIcon(item.icon)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-950">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-bold text-gray-950">
              {t.browserTitle}
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              {t.browserText}
            </p>
          </div>

          <p className="mt-4 text-[11px] leading-5 text-gray-500">
            {t.legalNote}
          </p>
        </div>

        <div className="relative border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={saveAcknowledgement}
            className="w-full rounded-full bg-[#088395] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#066c7a] hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
          >
            {t.button}
          </button>
        </div>
      </div>
    </div>
  );
}