"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface DBTemplate {
  id: string;
  name: string;
  type: string;
  template_key: string;
  preview_image_url: string | null;
  style_config: {
    templateKey?: string;
    primaryColor?: string;
    fontFamily?: string;
    layout?: string;
    sectionStyle?: string;
    sidebarColor?: string;
  };
  is_premium: boolean;
  created_at: string;
}

// Static catalog so the gallery renders even when the backend isn't reachable.
// Slug names match the fallbacks in ResumePreview's TEMPLATE_MAP.
const STATIC_TEMPLATES: DBTemplate[] = [
  {
    id: "static-classic-clean",
    name: "Classic Clean",
    type: "resume",
    template_key: "classic_clean",
    preview_image_url: "/html_previews/template2.jpg",
    style_config: { templateKey: "template2", primaryColor: "#0f172a", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-creative-bold",
    name: "Creative Bold",
    type: "resume",
    template_key: "creative_bold",
    preview_image_url: "/html_previews/template3.jpg",
    style_config: { templateKey: "template3", primaryColor: "#7c3aed", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-executive-elite",
    name: "Executive Elite",
    type: "resume",
    template_key: "executive_elite",
    preview_image_url: "/html_previews/template4.jpg",
    style_config: { templateKey: "template4", primaryColor: "#1f2937", fontFamily: "Georgia" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-tech-innovator",
    name: "Tech Innovator",
    type: "resume",
    template_key: "tech_innovator",
    preview_image_url: "/html_previews/template5.jpg",
    style_config: { templateKey: "template5", primaryColor: "#088395", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-designer-portfolio",
    name: "Designer Portfolio",
    type: "resume",
    template_key: "designer_portfolio",
    preview_image_url: "/html_previews/template6.jpg",
    style_config: { templateKey: "template6", primaryColor: "#db2777", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-academic-scholar",
    name: "Academic Scholar",
    type: "resume",
    template_key: "academic_scholar",
    preview_image_url: "/html_previews/template7.jpg",
    style_config: { templateKey: "template7", primaryColor: "#1e3a8a", fontFamily: "Georgia" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-startup-founder",
    name: "Startup Founder",
    type: "resume",
    template_key: "startup_founder",
    preview_image_url: "/html_previews/template8.jpg",
    style_config: { templateKey: "template8", primaryColor: "#ea580c", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-minimalist-pro",
    name: "Minimalist Pro",
    type: "resume",
    template_key: "minimalist_pro",
    preview_image_url: "/html_previews/template9.jpg",
    style_config: { templateKey: "template9", primaryColor: "#0ea5e9", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-bold-statement",
    name: "Bold Statement",
    type: "resume",
    template_key: "bold_statement",
    preview_image_url: "/html_previews/template10.jpg",
    style_config: { templateKey: "template10", primaryColor: "#d84d9b", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-modern-minimal",
    name: "Modern Minimal",
    type: "resume",
    template_key: "modern_minimal",
    preview_image_url: "/html_previews/template11.jpg",
    style_config: { templateKey: "template11", primaryColor: "#088395", fontFamily: "Inter" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "static-professional-classic",
    name: "Professional Classic",
    type: "resume",
    template_key: "professional_classic",
    preview_image_url: "/html_previews/template12.jpg",
    style_config: { templateKey: "template12", primaryColor: "#374151", fontFamily: "Georgia" },
    is_premium: false,
    created_at: "2024-01-01T00:00:00Z",
  },
];

let _cache: DBTemplate[] = STATIC_TEMPLATES;
let _fetched = false;
let _promise: Promise<DBTemplate[]> | null = null;

function fetchTemplates(): Promise<DBTemplate[]> {
  if (_fetched) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch(`${API_BASE}/templates/`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data: DBTemplate[] | null) => {
      if (Array.isArray(data) && data.length > 0) _cache = data;
      _fetched = true;
      return _cache;
    })
    .catch(() => {
      _fetched = true;
      return _cache;
    });
  return _promise;
}

/** Returns all templates. Renders a static catalog immediately, then refreshes from the backend if reachable. */
export function useTemplates() {
  const [templates, setTemplates] = useState<DBTemplate[]>(_cache);
  const [loading, setLoading] = useState(!_fetched);

  useEffect(() => {
    if (_fetched) {
      setTemplates(_cache);
      setLoading(false);
      return;
    }
    fetchTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  return { templates, loading };
}

/** Resolve one template by its slug (template_key). */
export function useTemplate(templateKey: string | null) {
  const { templates, loading } = useTemplates();
  const template = templateKey
    ? templates.find((t) => t.template_key === templateKey) ?? null
    : null;
  return { template, loading };
}
