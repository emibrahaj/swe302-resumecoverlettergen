"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8091";

export interface DBTemplate {
  id: string;
  name: string;
  type: string;
  template_key: string;
  preview_image_url: string | null;
  style_config: {
    templateKey?: string;   // e.g. "template10" — maps to the React component
    primaryColor?: string;  // e.g. "#d84d9b"
    fontFamily?: string;    // e.g. "Georgia"
    layout?: string;
    sectionStyle?: string;
    sidebarColor?: string;
  };
  is_premium: boolean;
  created_at: string;
}

// Module-level cache so multiple components share one request per page load
let _cache: DBTemplate[] | null = null;
let _promise: Promise<DBTemplate[]> | null = null;

function fetchTemplates(): Promise<DBTemplate[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch(`${API_BASE}/templates/`)
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch templates");
      return r.json();
    })
    .then((data: DBTemplate[]) => {
      _cache = Array.isArray(data) ? data : [];
      return _cache;
    })
    .catch(() => {
      _promise = null; // allow retry on next mount
      return [] as DBTemplate[];
    });
  return _promise;
}

/** Returns all templates from the DB, cached for the lifetime of the page. */
export function useTemplates() {
  const [templates, setTemplates] = useState<DBTemplate[]>(_cache ?? []);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache) {
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

/** Resolve one template by its slug (template_key). Returns null while loading. */
export function useTemplate(templateKey: string | null) {
  const { templates, loading } = useTemplates();
  const template = templateKey
    ? templates.find((t) => t.template_key === templateKey) ?? null
    : null;
  return { template, loading };
}