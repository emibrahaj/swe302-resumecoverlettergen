"use client";

import { useEffect, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { TEMPLATES } from "@/src/config/templates.config";

// Shape returned by the API (Supabase templates table)
interface ApiTemplate {
  name: string;
  type: string;
  preview_image_url: string | null;
  style_config: Record<string, unknown>;
  is_premium: boolean;
  created_at: string;
}

// Merged shape used for display
interface DisplayTemplate {
  template_key: string;
  name: string;
  category: string;
  is_premium: boolean;
  popular?: boolean;
  preview_image_url: string | null;
}

interface TemplateGalleryProps {
  /** Pre-fetched API templates (optional). When omitted the component fetches on its own. */
  templates?: any[];
  onViewAll: () => void;
  onSelectTemplate: (template_key: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function TemplateGallery({ templates: propTemplates, onViewAll, onSelectTemplate }: TemplateGalleryProps) {
  const [apiTemplates, setApiTemplates] = useState<ApiTemplate[]>([]);

  // Fetch from API only when no templates were passed in as props
  useEffect(() => {
    if (propTemplates && propTemplates.length > 0) return;
    fetch(`${API_BASE}/templates/`)
      .then((r) => r.json())
      .then((data: ApiTemplate[]) => setApiTemplates(Array.isArray(data) ? data : []))
      .catch(() => {/* silently fall back to skeleton-only display */});
  }, [propTemplates]);

  // Build a lookup from the API results (keyed by numeric string id matching templateMap)
  // The DB uses UUIDs as primary keys, so we match by name order or fall back to config order.
  const apiByPosition: Record<string, ApiTemplate> = {};
  apiTemplates.forEach((t, i) => {
    // Assign API rows in order to config positions (2…12)
    const configId = TEMPLATES[i]?.template_key;
    if (configId) apiByPosition[configId] = t;
  });

  // Merge: config is the source of truth for IDs/names; API supplies preview image + premium flag
  const displayTemplates: DisplayTemplate[] = TEMPLATES.map((cfg) => {
    const api = (propTemplates ?? []).find((t: any) => t.template_key === cfg.template_key) ?? apiByPosition[cfg.template_key];
    return {
      template_key: cfg.template_key,
      name: cfg.name,
      category: cfg.category,
      is_premium: api?.is_premium ?? cfg.isPremium,
      popular: cfg.popular,
      preview_image_url: api?.preview_image_url ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Choose your template</h1>
          <p className="text-white/90">Select from 900+ professionally designed templates</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes scroll-horizontal { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-scroll-horizontal { animation: scroll-horizontal 40s linear infinite; }
            .animate-scroll-horizontal:hover { animation-play-state: paused; }
          `}</style>

          <div className="flex gap-6 animate-scroll-horizontal mb-6">
            {[...displayTemplates, ...displayTemplates].map((template, index) => (
                <div
                    key={`${template.template_key}-${index}`}
                    onClick={() => onSelectTemplate(template.template_key)}
                    className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all flex-shrink-0 w-72"
                >
                  {template.popular && (
                      <div
                          className="absolute top-4 right-4 z-10 px-3 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                        <Star size={12} fill="currentColor"/>
                        <span className="text-xs font-semibold">Popular</span>
                      </div>
                  )}
                  {template.is_premium && (
                      <div
                          className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#088395] text-white rounded-full flex items-center gap-1">
                        <Sparkles size={12}/>
                        <span className="text-xs font-semibold">Pro</span>
                      </div>
                  )}

                  {/* Preview: real image when available, skeleton otherwise */}
                  <div className="aspect-[8.5/11] overflow-hidden bg-white">
                    <img
                        src={
                            template.preview_image_url ||
                            `/templates/template${template.template_key}.png`
                        }
                        alt={template.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-foreground/70 capitalize">{template.category}</p>
                  </div>

                  <div
                      className="absolute inset-0 bg-gradient-to-t from-[#088395]/90 to-teal-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" className="px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold">
                      Use This Template
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-foreground/70 mb-4">Want more templates? Create an account for access to 800+ additional
            designs</p>
          <button
              type="button"
              onClick={onViewAll}
              className="px-8 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
          >
            View All Templates
          </button>
        </div>
      </div>
    </div>
  );
}
