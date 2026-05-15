"use client";

import { Sparkles } from "lucide-react";
import { useTemplates } from "@/src/hooks/useTemplates";

interface TemplatesShowcaseProps {
  onSelectTemplate: (template_key: string) => void;
}

export function TemplatesShowcase({ onSelectTemplate }: TemplatesShowcaseProps) {
  const { templates, loading } = useTemplates();

  return (
    <section id="templates" className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Choose your template</h1>
            <p className="text-white/90">Select from 900+ professionally designed templates</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-[8.5/11]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.template_key}
                onClick={() => onSelectTemplate(template.template_key)}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
              >
                {template.is_premium && (
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-[#088395] text-white rounded-full flex items-center gap-1">
                    <Sparkles size={10} />
                    <span className="text-xs font-semibold">Pro</span>
                  </div>
                )}

                <div className="aspect-[8.5/11] overflow-hidden bg-gray-50">
                  {template.preview_image_url ? (
                    <img
                      src={template.preview_image_url}
                      alt={template.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${template.style_config.primaryColor ?? "#088395"}22, ${template.style_config.primaryColor ?? "#088395"}08)`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full opacity-20"
                        style={{ background: template.style_config.primaryColor ?? "#088395" }}
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-100">
                  <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                  <p className="text-xs text-foreground/70 capitalize">{template.type}</p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#088395]/90 to-teal-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" className="px-4 py-2 bg-white text-[#088395] rounded-lg font-semibold text-sm">
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}