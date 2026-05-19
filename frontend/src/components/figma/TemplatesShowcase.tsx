"use client";

import { Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSubscription } from "@/src/context/SubscriptionContext";
import { useTemplates } from "@/src/hooks/useTemplates";
import { useLanguage } from "@/src/context/LanguageContext";

interface TemplatesShowcaseProps {
  onSelectTemplate: (templateId: string) => void;
}

export function TemplatesShowcase({ onSelectTemplate }: TemplatesShowcaseProps) {
  const { isPro } = useSubscription();
  const router = useRouter();
  const { templates, loading } = useTemplates();
  const { t } = useLanguage();
  const copy = t.templateGallery;

  const handleSelect = (templateKey: string, isPremium: boolean) => {
    if (isPremium && !isPro) {
      toast.info(copy.proOnlyToast);
      router.push("/pricing?from=templates");
      return;
    }
    onSelectTemplate(templateKey);
  };

  return (
    <section id="templates" className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">{copy.title}</h1>
            <p className="text-white/90">{copy.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 animate-pulse" style={{ aspectRatio: "8.5/11" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => {
              const locked = template.is_premium && !isPro;
              return (
                <div
                  key={template.template_key}
                  onClick={() => handleSelect(template.template_key, template.is_premium)}
                  className={`group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all ${locked ? "ring-1 ring-yellow-300" : ""}`}
                >
                  {template.is_premium && (
                    <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full flex items-center gap-1 ${locked ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white" : "bg-[#088395] text-white"}`}>
                      {locked ? <Lock size={9} /> : <Sparkles size={10} />}
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
                        <div className="w-16 h-16 rounded-full opacity-20" style={{ background: template.style_config.primaryColor ?? "#088395" }} />
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-100">
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-foreground/70 capitalize">{template.type}</p>
                  </div>

                  <div className={`absolute inset-0 ${locked ? "bg-gradient-to-t from-yellow-500/85 to-orange-500/85" : "bg-gradient-to-t from-[#088395]/90 to-teal-600/90"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                    <button type="button" className="px-4 py-2 bg-white text-[#088395] rounded-lg font-semibold text-sm flex items-center gap-2">
                      {locked ? (<><Lock size={12} /> {copy.upgradeToUnlock}</>) : copy.useTemplate}
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
