"use client";

import { Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSubscription } from "@/src/context/SubscriptionContext";
import { useTemplates } from "@/src/hooks/useTemplates";

interface TemplatesShowcaseProps {
  onSelectTemplate: (templateId: string) => void;
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

function parseStyleConfig(styleConfig: TemplateItem["style_config"]): TemplateStyleConfig {
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

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

export function TemplatesShowcase({ onSelectTemplate }: TemplatesShowcaseProps) {
  const { isPro } = useSubscription();
  const router = useRouter();
  const { templates, loading } = useTemplates();

  const handleSelect = (templateKey: string, isPremium: boolean) => {
    if (!templateKey) {
      toast.error("This template is missing its template key.");
      return;
    }

    if (isPremium && !isPro) {
      toast.info("This template is Pro-only. Upgrade to unlock it.");
      router.push("/pricing?from=templates");
      return;
    }

    onSelectTemplate(templateKey);
  };

  return (
    <section
      id="templates"
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white"
    >
      <div className="mb-12">
        <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">
              Choose your template
            </h1>
            <p className="text-white/90">
              Select from professionally designed templates
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`template-skeleton-${index}`}
                className="rounded-xl bg-gray-100 animate-pulse"
                style={{ aspectRatio: "8.5/11" }}
              />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No templates found
            </h2>
            <p className="text-sm text-gray-600">
              The frontend loaded correctly, but the backend did not return any
              templates. Check your backend `/templates/` route and `.env`
              settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(templates as TemplateItem[]).map((template, index) => {
              const styleConfig = parseStyleConfig(template.style_config);

              const templateKey =
                styleConfig.file ||
                styleConfig.templateKey ||
                styleConfig.template_key ||
                template.template_key ||
                template.templateKey ||
                template.key ||
                template.id ||
                `template-${index}`;

              const uniqueKey = `${templateKey}-${index}`;

              const isPremium = Boolean(template.is_premium ?? template.isPremium);
              const locked = isPremium && !isPro;

              const accentColor =
                styleConfig.accent ||
                styleConfig.primaryColor ||
                styleConfig.primary_color ||
                "#088395";

              const imageSrc = normalizeImagePath(template.preview_image_url);

              return (
                <div
                  key={uniqueKey}
                  onClick={() => handleSelect(templateKey, isPremium)}
                  className={`group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all ${
                    locked ? "ring-1 ring-yellow-300" : ""
                  }`}
                >
                  {isPremium && (
                    <div
                      className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full flex items-center gap-1 ${
                        locked
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                          : "bg-[#088395] text-white"
                      }`}
                    >
                      {locked ? <Lock size={9} /> : <Sparkles size={10} />}
                      <span className="text-xs font-semibold">Pro</span>
                    </div>
                  )}

                  <div className="aspect-[8.5/11] overflow-hidden bg-gray-50">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={template.name || "Resume template"}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
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

                  <div className="p-3 border-t border-gray-100">
                    <h3 className="font-semibold text-sm mb-1">
                      {template.name || "Untitled template"}
                    </h3>
                    <p className="text-xs text-foreground/70 capitalize">
                      {template.type || "resume"}
                    </p>
                  </div>

                  <div
                    className={`absolute inset-0 ${
                      locked
                        ? "bg-gradient-to-t from-yellow-500/85 to-orange-500/85"
                        : "bg-gradient-to-t from-[#088395]/90 to-teal-600/90"
                    } opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                  >
                    <button
                      type="button"
                      className="px-4 py-2 bg-white text-[#088395] rounded-lg font-semibold text-sm flex items-center gap-2"
                    >
                      {locked ? (
                        <>
                          <Lock size={12} />
                          Upgrade to Unlock
                        </>
                      ) : (
                        "Use This Template"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}