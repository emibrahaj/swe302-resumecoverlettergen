"use client";

import {Language, useLanguage} from "@/src/context/LanguageContext";

const languageOptions: Array<{ code: Language; flag: string; shortLabel: string }> = [
    {code: "sq", flag: "🇦🇱", shortLabel: "SQ"},
    {code: "en", flag: "🇬🇧", shortLabel: "EN"},
];

export function LanguageToggle({compact = false}: { compact?: boolean }) {
    const {language, setLanguage, t} = useLanguage();

    return (
        <div
            className={`inline-flex items-center rounded-full border border-[#088395]/30 bg-white p-1 shadow-sm ${compact ? "w-fit" : ""}`}
            aria-label={t.language.label}
        >
            {languageOptions.map((option) => {
                const isActive = language === option.code;
                return (
                    <button
                        key={option.code}
                        type="button"
                        onClick={() => setLanguage(option.code)}
                        className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition-colors ${
                            isActive
                                ? "bg-[#088395] text-white"
                                : "text-foreground/70 hover:bg-[#088395]/10 hover:text-[#088395]"
                        }`}
                        aria-pressed={isActive}
                        title={option.code === "sq" ? t.language.albanian : t.language.english}
                    >
                        <span aria-hidden="true" className="text-base leading-none">{option.flag}</span>
                        <span>{option.shortLabel}</span>
                    </button>
                );
            })}
        </div>
    );
}
