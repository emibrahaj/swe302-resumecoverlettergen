"use client";

import { Sparkles } from "lucide-react";
import { useTemplates } from "@/src/hooks/useTemplates";

interface TemplateShowcaseProps {
  onViewAll: () => void;
  onSelectTemplate: (template_key: string) => void;
}

type TemplateStyleConfig = {
  file?: string;
  accent?: string;
  primaryColor?: string;
  primary_color?: string;
  templateKey?: string;
  template_key?: string;
};

type TemplateItem = {
  id?: string;
  name?: string;
  type?: string;
  template_key?: string;
  templateKey?: string;
  key?: string;
  preview_image_url?: string | null;
  is_premium?: boolean;
  isPremium?: boolean;
  style_config?: TemplateStyleConfig | string | null;
};

function parseStyleConfig(
  styleConfig: TemplateItem["style_config"]
): TemplateStyleConfig {
  if (!styleConfig) return {};

  if (typeof styleConfig === "string") {
    try {
      return JSON.parse(styleConfig);
    } catch {
      return {};
    }
  }

  return styleConfig;
}

function normalizeImagePath(path?: string | null) {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }

  return `/${path}`;
}

function getTemplateNumber(templateKey: string) {
  const match = templateKey.match(/template_?(\d+)\.html/i);
  return match?.[1] ?? null;
}

function getFallbackPreviewImage(templateKey: string) {
  const templateNumber = getTemplateNumber(templateKey);

  if (!templateNumber) return null;

  return `/html_previews/template${templateNumber}.jpg`;
}

export function TemplateShowcase({
  onViewAll,
  onSelectTemplate,
}: TemplateShowcaseProps) {
  const { templates, loading } = useTemplates();

  const templateItems = templates as TemplateItem[];
  const carouselItems = [...templateItems, ...templateItems];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-cyan-50 to-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Professional <span className="text-[#088395]">Templates</span>
          </h2>
          <p className="text-xl text-foreground/70">
            Choose from professionally designed templates
          </p>
        </div>

        <div className="relative overflow-hidden">
          <style>{`
            @keyframes scroll-horizontal {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .animate-scroll-horizontal {
              animation: scroll-horizontal 40s linear infinite;
              width: max-content;
            }

            .animate-scroll-horizontal:hover {
              animation-play-state: paused;
            }
          `}</style>

          {loading ? (
            <div className="flex gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`template-carousel-skeleton-${index}`}
                  className="flex-shrink-0 w-72 rounded-2xl bg-gray-100 animate-pulse shadow-sm"
                  style={{ aspectRatio: "8.5/11" }}
                />
              ))}
            </div>
          ) : templateItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-sm text-gray-600">
                Check that the backend is running and returning data from
                /templates/.
              </p>
            </div>
          ) : (
            <div className="flex gap-6 animate-scroll-horizontal mb-6">
              {carouselItems.map((template, index) => {
                const styleConfig = parseStyleConfig(template.style_config);

                const templateKey =
                  template.template_key ||
                  template.templateKey ||
                  styleConfig.file ||
                  styleConfig.templateKey ||
                  styleConfig.template_key ||
                  template.key ||
                  template.id ||
                  `template-${index}`;

                const isPremium = Boolean(
                  template.is_premium ?? template.isPremium
                );

                const accentColor =
                  styleConfig.accent ||
                  styleConfig.primaryColor ||
                  styleConfig.primary_color ||
                  "#088395";

                const imageSrc =
                  normalizeImagePath(template.preview_image_url) ||
                  getFallbackPreviewImage(templateKey);

                return (
                  <div
                    key={`${templateKey}-${index}`}
                    onClick={() => onSelectTemplate(templateKey)}
                    className="group relative bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex-shrink-0 w-72"
                  >
                    {isPremium && (
                      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-[#088395] text-white rounded-full flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={12} />
                        <span className="text-xs font-bold">Pro</span>
                      </div>
                    )}

                    <div className="aspect-[8.5/11] overflow-hidden bg-gray-100 flex items-start justify-center">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={template.name || "Resume template"}
                          className="w-full h-full object-contain object-top p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
                          }}
                        >
                          <div
                            className="w-16 h-16 rounded-full opacity-20"
                            style={{ background: accentColor }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                      <h3 className="font-bold text-base mb-1 text-gray-900 truncate">
                        {template.name || "Untitled template"}
                      </h3>
                      <p className="text-sm text-foreground/70 capitalize">
                        {template.type || "resume"}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#088395]/90 to-teal-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <button
                        type="button"
                        className="px-6 py-3 bg-white text-[#088395] rounded-xl font-bold shadow-lg"
                      >
                        Use This Template
                      </button>
                    </div>
                  </div>
                );
              })}
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

        <div className="h-20 sm:h-24" aria-hidden="true"/>
      </div>
    </section>
  );
}