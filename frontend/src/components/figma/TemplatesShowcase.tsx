"use client";

import { Lock, Sparkles, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATES } from "@/src/config/templates.config";
import { TemplateSkeleton } from "./TemplateSkeleton";
import { useSubscription } from "@/src/context/SubscriptionContext";


interface TemplatesShowcaseProps {
  onSelectTemplate: (templateId: string) => void;
}

export function TemplatesShowcase({ onSelectTemplate }: TemplatesShowcaseProps) {
  const { isPro } = useSubscription();
  const router = useRouter();

  const handleSelect = (templateId: string, isPremium: boolean) => {
    if (isPremium && !isPro) {
      toast.info("This template is Pro-only. Upgrade to unlock it.");
      router.push("/pricing?from=templates");
      return;
    }
    onSelectTemplate(templateId);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((template) => {
            const locked = template.isPremium && !isPro;
            return (
              <div
                key={template.id}
                onClick={() => handleSelect(template.id, !!template.isPremium)}
                className={`group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all ${locked ? "ring-1 ring-yellow-300" : ""}`}
              >
                {template.popular && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" />
                    <span className="text-xs font-semibold">Popular</span>
                  </div>
                )}
                {template.isPremium && (
                  <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full flex items-center gap-1 ${locked ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white" : "bg-[#088395] text-white"}`}>
                    {locked ? <Lock size={9} /> : <Sparkles size={10} />}
                    <span className="text-xs font-semibold">Pro</span>
                  </div>
                )}

                <div className="aspect-[8.5/11] bg-gradient-to-br from-cyan-50 to-teal-100 p-4">
                  <TemplateSkeleton id={template.id} />
                </div>

                <div className="p-3 border-t border-gray-100">
                  <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                  <p className="text-xs text-foreground/70 capitalize">{template.category}</p>
                </div>

                <div className={`absolute inset-0 ${locked ? "bg-gradient-to-t from-yellow-500/85 to-orange-500/85" : "bg-gradient-to-t from-[#088395]/90 to-teal-600/90"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                  <button
                    type="button"
                    className="px-4 py-2 bg-white text-[#088395] rounded-lg font-semibold text-sm flex items-center gap-2"
                  >
                    {locked ? (<><Lock size={12} /> Upgrade to Unlock</>) : "Use This Template"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
