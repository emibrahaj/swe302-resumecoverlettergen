"use client";

import { Lock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSubscription } from '@/src/context/SubscriptionContext';
import { useTemplates } from "@/src/hooks/useTemplates";

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  onViewAll: () => void;
}

export function TemplateGallery({ onSelectTemplate, onViewAll }: TemplateGalleryProps) {
  const { isPro } = useSubscription();
  const router = useRouter();
  const { templates, loading } = useTemplates();

  const handleSelect = (templateKey: string, isPremium: boolean) => {
    if (isPremium && !isPro) {
      toast.info('This template is Pro-only. Upgrade to unlock it.');
      router.push('/pricing?from=template-gallery');
      return;
    }
    onSelectTemplate(templateKey);
  };

  return (
    <div className="min-h-screen mb-10 bg-gray">
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

          {loading ? (
            <div className="flex gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 rounded-xl bg-gray-100 animate-pulse" style={{ aspectRatio: "8.5/11" }} />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 animate-scroll-horizontal mb-6">
              {[...templates, ...templates].map((template, index) => {
                const locked = template.is_premium && !isPro;
                return (
                  <div
                    key={`${template.template_key}-${index}`}
                    onClick={() => handleSelect(template.template_key, template.is_premium)}
                    className={`group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all flex-shrink-0 w-72 ${locked ? 'ring-1 ring-yellow-300' : ''}`}
                  >
                    {template.is_premium && (
                      <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full flex items-center gap-1 ${locked ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-[#088395] text-white'}`}>
                        {locked ? <Lock size={11} /> : <Sparkles size={12} />}
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

                    <div className="p-4 border-t border-gray-100">
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-foreground/70 capitalize">{template.type}</p>
                    </div>

                    <div className={`absolute inset-0 ${locked ? 'bg-gradient-to-t from-yellow-500/85 to-orange-500/85' : 'bg-gradient-to-t from-[#088395]/90 to-teal-600/90'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                      <button className="px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold flex items-center gap-2">
                        {locked ? (<><Lock size={14} /> Upgrade to Unlock</>) : 'Use This Template'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-foreground/70 mb-4">Want more templates? Create an account for access to 800+ additional designs</p>
          <button onClick={onViewAll} className="px-8 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all">
            View All Templates
          </button>
        </div>
      </div>
    </div>
  );
}