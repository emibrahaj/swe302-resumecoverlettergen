"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ResumePreview, type CVData } from "@/src/components/figma/ResumePreview";
import { ensureFontLoaded, getFontCss } from "@/src/lib/fonts";
import { useTemplate } from "@/src/hooks/useTemplates";

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
  // The raw template identifier saved on the resume (a template_key like
  // "programming", a slug, or a numeric). It is resolved to the actual renderer
  // below via the SAME path the editor uses.
  const [savedTemplateKey, setSavedTemplateKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Resolve the renderer template exactly like CVBuilder does: look the template
  // up by key and use style_config.templateKey. The editor renders e.g. "template4"
  // for the "programming" key, but the raw key isn't in ResumePreview's TEMPLATE_MAP,
  // so using it directly fell back to a DIFFERENT template (template5) — which is
  // why the PDF's header/layout didn't match the live preview.
  const { template: dbTemplate, loading: templateLoading } = useTemplate(
    savedTemplateKey || null,
  );
  const resolvedKey = dbTemplate?.style_config?.templateKey ?? savedTemplateKey ?? "3";
  const templateId = /^\d+$/.test(resolvedKey) ? `template${resolvedKey}` : resolvedKey;

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

        // Capture the saved template identifier (template_key / slug / numeric).
        // It's resolved to the actual renderer at the top of the component via the
        // DB template's style_config.templateKey — the same path the editor uses —
        // so the PDF and the live preview always render the same template.
        setSavedTemplateKey(
          overrideTemplate || String(design.template_id ?? resume.template_id ?? "3"),
        );

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
            // website / github / linkedin are part of the header in several
            // templates; the editor includes them, so the PDF must too.
            website:  String(merged.website ?? ""),
            github:   String(merged.github ?? ""),
            linkedin: String(merged.linkedin ?? ""),
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
          // Structured skills carry the proficiency level + items/tools per
          // category, which the templates render. Without this the PDF would
          // only show category names (the flat `skills` fallback) — diverging
          // from the live preview.
          technicalSkills: Array.isArray(merged.skills)
            ? (merged.skills as Array<unknown>).map((s) => {
                if (typeof s === "string") {
                  return { name: s, category: s, level: "", proficiency: "", items: [], rating: 0 };
                }
                const obj = s as Record<string, unknown>;
                const name = String(obj.skill_name ?? obj.name ?? "");
                const proficiency = String(obj.proficiency ?? obj.level ?? "");
                const items = Array.isArray(obj.items)
                  ? (obj.items as unknown[]).map((it) => String(it).trim()).filter(Boolean)
                  : typeof obj.items === "string"
                    ? obj.items.split(",").map((it) => it.trim()).filter(Boolean)
                    : [];
                return {
                  name,
                  category: name,
                  level: proficiency,
                  proficiency,
                  items,
                  rating: typeof obj.rating === "number" ? obj.rating : 0,
                };
              }).filter((s) => s.name)
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
          // Resolve the saved font name to the SAME CSS stack the editor uses, and
          // load the matching web font so the PDF renders with identical glyph
          // metrics (and therefore identical wrapping + page breaks).
          fontFamily: getFontCss(
            typeof design.font_family === "string" ? design.font_family : "Inter",
          ),
        };
        ensureFontLoaded(
          typeof design.font_family === "string" ? design.font_family : "Inter",
        );
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
  // Wait for both the resume data AND the template resolution before rendering,
  // so the headless PDF capture never fires on a wrong/fallback template.
  if (!data || (!!savedTemplateKey && templateLoading)) {
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
        // data.fontFamily is already a full CSS stack (e.g. '"Roboto", sans-serif').
        fontFamily: data.fontFamily,
      }}
    >
      <style>{`
        html, body { margin: 0; padding: 0; background: #fff; }
        body * { box-sizing: border-box; }
        /* Hide ONLY the global chrome the root layout injects (cookie gate, toast
           notifications, popovers). Do NOT hide nav/header/footer: several resume
           templates render their name + contact block inside a <header> element,
           and a blanket "header { display:none }" was erasing the whole header from
           the PDF while the live preview (which has no such rule) kept it. */
        [role="dialog"], [data-radix-popper-content-wrapper],
        [data-sonner-toaster], [data-cookie-gate] { display: none !important; }
        /* keep coloured backgrounds (sidebar tints, accent bars, skill rings) in print */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { size: A4; margin: 0; }
        /* No forced break-inside/break-after rules: the live editor preview flows
           the resume continuously and draws the page boundary at exact A4 heights.
           Letting the PDF break at the same pixel positions (instead of pushing a
           whole section to the next page) is what makes the export match the
           preview 1:1 on multi-page resumes. */
        @media print {
          html, body { width: 210mm; }
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
