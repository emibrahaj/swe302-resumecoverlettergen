"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CookiePolicyModal } from "./CookiePolicyModal";

const CONSENT_STORAGE_KEY = "diversihire_cookie_consent";

// Routes that must never show chrome (cookie banner, toasts, etc.) because
// they're captured headlessly by Playwright for PDF generation.
const HEADLESS_ROUTE_PREFIXES = ["/preview-public"];

/**
 * Mounts the cookie consent modal automatically on first visit.
 * Reads `diversihire_cookie_consent` from localStorage; if it's absent
 * (or unparseable), opens the modal. Once the user saves any choice from
 * inside the modal, the key gets written and the modal stays closed on
 * subsequent visits.
 */
export function CookieConsentGate() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHeadless = HEADLESS_ROUTE_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (isHeadless) return;
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        setOpen(true);
        return;
      }
      JSON.parse(saved);
    } catch {
      setOpen(true);
    }
  }, [isHeadless]);

  if (isHeadless || !mounted) return null;

  return <CookiePolicyModal isOpen={open} onClose={() => setOpen(false)} />;
}
