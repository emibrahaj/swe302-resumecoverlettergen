"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ResumePreview, type CVData } from "@/src/components/figma/ResumePreview";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8091";

/**
 * Headless preview page used by the backend's Playwright-based PDF renderer.
 * - URL: /preview-public/[id]?token=<bearer>
 * - Fetches the resume via the backend, reshapes raw_content -> CVData, and renders
 *   the same <ResumePreview> the user sees in the CV builder.
 * - No nav chrome, no scrollbars — sized to A4 portrait at 96 dpi (794 x 1123 px)
 *   so Playwright captures a clean single page.
 */
function PreviewPublicContent() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const token = search?.get("token") ?? "";
  const overrideTemplate = search?.get("template") ?? "";

  const [data, setData] = useState<CVData | null>(null);
  const [templateId, setTemplateId] = useState<string>("3");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    const id = String(params.id);
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE}/resume/my-resumes/${id}`, { headers })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((resume) => {
        const raw = (resume.raw_content || {}) as Record<string, unknown>;
        const polished = (resume.polished_content || {}) as Record<string, unknown>;
        // raw_content is the source of truth — the editor's "Save" writes the
        // current form state (which already reflects any AI Enhance / Expand
        // edits the user accepted) into raw_content right before download. The
        // PDF must match exactly what the user sees in the live preview, so we
        // read raw first. polished_content is only used to backfill fields the
        // raw payload doesn't carry (rare — kept for backwards compat).
        const merged = { ...polished, ...raw } as Record<string, unknown>;
        const design = (raw._design || polished._design || {}) as Record<string, unknown>;

        // The form saves the numeric template id ("11"). ResumePreview's
        // TEMPLATE_MAP is keyed by "template11" / slug — so the bare number
        // would fall back to template5 and the PDF would render with a
        // completely different layout than the user's live preview. Normalize
        // numerics by prefixing "template".
        const rawTplId = overrideTemplate || String(design.template_id ?? resume.template_id ?? "3");
        const chosenTemplate = /^\d+$/.test(rawTplId) ? `template${rawTplId}` : rawTplId;
        setTemplateId(chosenTemplate);

        const linksRaw = Array.isArray(merged.links)
          ? (merged.links as Array<Record<string, unknown>>)
          : Array.isArray(merged.profiles)
            ? (merged.profiles as Array<Record<string, unknown>>)
            : [];

        const cvData: CVData = {
          personalInfo: {
            fullName: String(merged.full_name ?? ""),
            email:    String(merged.email ?? ""),
            phone:    String(merged.phone ?? ""),
            location: String(merged.address ?? ""),
            title:    String(merged.target_job_title ?? ""),
            summary:  String(merged.about ?? merged.summary ?? ""),
          },
          cvPhoto: (typeof merged.photo_url === "string" && merged.photo_url) ? String(merged.photo_url) : null,
          workExperience: Array.isArray(merged.experiences)
            ? (merged.experiences as Array<Record<string, unknown>>).map((e, i) => ({
                id: String(e.id ?? i),
                title: String(e.job_title ?? e.role ?? e.title ?? ""),
                company: String(e.company ?? e.company_name ?? ""),
                location: String(e.location ?? ""),
                startDate: String(e.start_date ?? e.startDate ?? ""),
                endDate: String(e.end_date ?? e.endDate ?? ""),
                description: String(e.description ?? ""),
              }))
            : [],
          education: Array.isArray(merged.education)
            ? (merged.education as Array<Record<string, unknown>>).map((e, i) => ({
                id: String(e.id ?? i),
                degree: String(e.degree ?? ""),
                school: String(e.university ?? e.school ?? ""),
                year: String(e.end_year ?? e.year ?? ""),
              }))
            : [],
          skills: Array.isArray(merged.skills)
            ? (merged.skills as Array<unknown>).map((s) =>
                typeof s === "string" ? s : String((s as Record<string, unknown>).skill_name ?? "")
              ).filter(Boolean)
            : [],
          projects: Array.isArray(merged.projects)
            ? (merged.projects as Array<Record<string, unknown>>).map((p, i) => ({
                id: String(p.id ?? i),
                name: String(p.name ?? p.project_name ?? ""),
                startDate: String(p.start_date ?? p.startDate ?? ""),
                endDate: String(p.end_date ?? p.endDate ?? ""),
                description: String(p.description ?? ""),
              }))
            : [],
          // Languages / certifications / custom sections / online links live in
          // raw_content; without these the templates render an empty sidebar
          // and the user sees only Education + Experience + Projects in the PDF.
          languages: Array.isArray(merged.languages)
            ? (merged.languages as Array<Record<string, unknown>>).map((l, i) => ({
                id: String(l.language_id ?? l.id ?? i),
                language_name: String(l.language_name ?? l.name ?? l.language ?? ""),
                proficiency: String(l.proficiency ?? l.level ?? ""),
              })).filter((l) => l.language_name)
            : [],
          certifications: Array.isArray(merged.certifications)
            ? (merged.certifications as Array<Record<string, unknown>>).map((c, i) => ({
                id: String(c.certification_id ?? c.id ?? i),
                certification_name: String(c.certification_name ?? c.name ?? c.title ?? ""),
                date_obtained: String(c.date_obtained ?? c.date ?? ""),
                issuer: String(c.issuer ?? c.company_name ?? c.organization ?? ""),
              })).filter((c) => c.certification_name)
            : [],
          customSections: Array.isArray(design.custom_sections)
            ? (design.custom_sections as Array<Record<string, unknown>>).map((s, i) => ({
                id: String(s.id ?? i),
                title: String(s.title ?? ""),
                items: Array.isArray(s.items) ? (s.items as unknown[]).map((it) => String(it)) : [],
              })).filter((s) => s.title)
            : [],
          onlineLinks: linksRaw.map((l, i) => ({
            id: String(l.id ?? i),
            platform: String(l.platform ?? l.label ?? l.name ?? ""),
            url: String(l.url ?? l.link ?? ""),
          })).filter((l) => l.platform || l.url),
          sectionOrder: Array.isArray(design.section_order)
            ? (design.section_order as string[])
            : ["experience", "education", "skills", "projects"],
          accentColor: typeof design.accent_color === "string" ? design.accent_color : "#088395",
          fontFamily: typeof design.font_family === "string" ? design.font_family : "Inter",
        };
        setData(cvData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load resume"));
  }, [params?.id, token, overrideTemplate]);

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", color: "#b91c1c" }}>
        Preview load failed: {error}
      </div>
    );
  }
  if (!data) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</div>;
  }

  // Wrap in a fixed-width container the size of an A4 page at 96 dpi so Playwright
  // captures the preview as a single clean page. The page itself omits all nav/chrome.
  return (
    <main
      data-preview="public"
      style={{
        width: "794px",
        margin: 0,
        padding: 0,
        background: "#ffffff",
        fontFamily: `'${data.fontFamily}', sans-serif`,
      }}
    >
      <style>{`
        html, body { margin: 0; padding: 0; background: #fff; }
        body * { box-sizing: border-box; }
        /* hide any global app chrome that might leak through */
        nav, header, footer,
        [role="dialog"], [data-radix-popper-content-wrapper],
        [data-sonner-toaster], [data-cookie-gate] { display: none !important; }
        /* keep coloured backgrounds (sidebar tints, accent bars) in print */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { size: A4; margin: 0; }
        @media print {
          html, body { width: 210mm; }
          /* Avoid splitting individual entries across pages where possible */
          section, .resume-card, [data-resume-card] { break-inside: avoid; page-break-inside: avoid; }
          h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
          li, p { orphans: 2; widows: 2; }
        }
      `}</style>
      <ResumePreview templateId={templateId} data={data} />
    </main>
  );
}

export default function PreviewPublicPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</div>}>
      <PreviewPublicContent />
    </Suspense>
  );
}
