"use client";

import { useEffect, useState } from "react";
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
export default function PreviewPublicPage() {
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
        // Prefer polished content where available, fall back to raw.
        const merged = { ...raw, ...polished };
        const design = (raw._design || polished._design || {}) as Record<string, unknown>;

        const chosenTemplate = overrideTemplate || String(design.template_id ?? "3");
        setTemplateId(chosenTemplate);

        const cvData: CVData = {
          personalInfo: {
            fullName: String((merged as Record<string, unknown>).full_name ?? ""),
            email:    String((merged as Record<string, unknown>).email ?? ""),
            phone:    String((merged as Record<string, unknown>).phone ?? ""),
            location: String((merged as Record<string, unknown>).address ?? ""),
            title:    String((merged as Record<string, unknown>).target_job_title ?? ""),
            summary:  String((merged as Record<string, unknown>).about ?? (merged as Record<string, unknown>).summary ?? ""),
          },
          cvPhoto: (typeof (merged as Record<string, unknown>).photo_url === "string" && (merged as Record<string, unknown>).photo_url) ? String((merged as Record<string, unknown>).photo_url) : null,
          workExperience: Array.isArray((merged as Record<string, unknown>).experiences)
            ? ((merged as Record<string, unknown>).experiences as Array<Record<string, unknown>>).map((e, i) => ({
                id: String(e.id ?? i),
                title: String(e.job_title ?? e.role ?? e.title ?? ""),
                company: String(e.company ?? e.company_name ?? ""),
                location: String(e.location ?? ""),
                startDate: String(e.start_date ?? e.startDate ?? ""),
                endDate: String(e.end_date ?? e.endDate ?? ""),
                description: String(e.description ?? ""),
              }))
            : [],
          education: Array.isArray((merged as Record<string, unknown>).education)
            ? ((merged as Record<string, unknown>).education as Array<Record<string, unknown>>).map((e, i) => ({
                id: String(e.id ?? i),
                degree: String(e.degree ?? ""),
                school: String(e.university ?? e.school ?? ""),
                year: String(e.end_year ?? e.year ?? ""),
              }))
            : [],
          skills: Array.isArray((merged as Record<string, unknown>).skills)
            ? ((merged as Record<string, unknown>).skills as Array<unknown>).map((s) =>
                typeof s === "string" ? s : String((s as Record<string, unknown>).skill_name ?? "")
              ).filter(Boolean)
            : [],
          projects: Array.isArray((merged as Record<string, unknown>).projects)
            ? ((merged as Record<string, unknown>).projects as Array<Record<string, unknown>>).map((p, i) => ({
                id: String(p.id ?? i),
                name: String(p.name ?? p.project_name ?? ""),
                startDate: String(p.start_date ?? p.startDate ?? ""),
                endDate: String(p.end_date ?? p.endDate ?? ""),
                description: String(p.description ?? ""),
              }))
            : [],
          customSections: Array.isArray(design.custom_sections) ? (design.custom_sections as CVData["customSections"]) : [],
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
        nav, header, footer { display: none !important; }
      `}</style>
      <ResumePreview templateId={templateId} data={data} />
    </main>
  );
}
