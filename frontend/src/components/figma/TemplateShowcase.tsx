"use client";

import { Sparkles, Star } from "lucide-react";
import { useTemplates } from "@/src/hooks/useTemplates";

interface TemplateShowcaseProps {
  onViewAll: () => void;
  onSelectTemplate: (template_key: string) => void;
}

export function TemplateShowcase({ onViewAll, onSelectTemplate }: TemplateShowcaseProps) {
  const { templates, loading } = useTemplates();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-cyan-50 to-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Professional <span className="text-[#088395]">Templates</span>
          </h2>
          <p className="text-xl text-foreground/70">
            Choose from 900+ expertly designed templates
          </p>
        </div>

        <div className="relative overflow-hidden">
          <style>{`
            @keyframes scroll-horizontal { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-scroll-horizontal { animation: scroll-horizontal 40s linear infinite; }
            .animate-scroll-horizontal:hover { animation-play-state: paused; }
          `}</style>

          {loading ? (
            /* Skeleton row while fetching */
            <div className="flex gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-72 rounded-xl bg-gray-100 animate-pulse"
                  style={{ aspectRatio: "8.5/11" }}
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 animate-scroll-horizontal mb-6">
              {[...templates, ...templates].map((template, index) => (
                <div
                  key={`${template.template_key}-${index}`}
                  onClick={() => onSelectTemplate(template.template_key)}
                  className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all flex-shrink-0 w-72"
                >
                  {template.is_premium && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#088395] text-white rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
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
                      /* Colour-tinted placeholder using the template's primary colour */
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${template.style_config.primaryColor ?? "#088395"}22, ${template.style_config.primaryColor ?? "#088395"}08)`,
                        }}
                      >
                        <div
                          className="w-16 h-16 rounded-full opacity-20"
                          style={{ background: template.style_config.primaryColor ?? "#088395" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-foreground/70 capitalize">{template.type}</p>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#088395]/90 to-teal-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" className="px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold">
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="px-8 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all"
          >
            View All Templates
          </button>
        </div>
      </div>
    </section>
  );
}