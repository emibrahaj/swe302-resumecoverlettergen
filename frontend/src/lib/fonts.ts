// Single source of truth for the resume fonts. Both the live editor preview
// (CVBuilder) and the headless PDF render target (preview-public) import from
// here so the exported PDF uses the EXACT same web fonts — and therefore the
// exact same glyph metrics, line wrapping, and page breaks — as the preview.
// Loading a different (or fallback) font is the single biggest source of
// "the PDF doesn't match what I saw on screen".

export const RESUME_FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat"] as const;

// Google Fonts stylesheet URLs, with the weights each template actually uses.
export const GOOGLE_FONT_URLS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
  Lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap",
};

// The CSS font-family stack applied to the rendered resume.
export const FONT_CSS: Record<string, string> = {
  Inter: '"Inter", sans-serif',
  Roboto: '"Roboto", sans-serif',
  "Open Sans": '"Open Sans", sans-serif',
  Lato: '"Lato", sans-serif',
  Montserrat: '"Montserrat", sans-serif',
};

/** Resolve a saved font name (e.g. "Roboto") to a full CSS font-family stack. */
export function getFontCss(name?: string | null): string {
  if (!name) return FONT_CSS.Inter;
  if (FONT_CSS[name]) return FONT_CSS[name];
  // Already a stack (contains a comma) — pass through; otherwise wrap it.
  return name.includes(",") ? name : `"${name}", sans-serif`;
}

/** Google Fonts stylesheet href for a saved font name, or null if not a known web font. */
export function getFontLinkHref(name?: string | null): string | null {
  if (!name) return GOOGLE_FONT_URLS.Inter;
  return GOOGLE_FONT_URLS[name] ?? null;
}

/**
 * Inject a Google Fonts <link> into <head> exactly once (idempotent by id).
 * Mirrors the editor's loader so the preview and the PDF request the same font.
 */
export function ensureFontLoaded(name?: string | null): void {
  if (typeof document === "undefined") return;
  const href = getFontLinkHref(name);
  if (!href || !name) return;
  const linkId = `gfont-${name.replaceAll(/\s+/g, "-")}`;
  if (document.getElementById(linkId)) return;
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
