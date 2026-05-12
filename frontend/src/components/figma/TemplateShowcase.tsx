"use client";

import { Sparkles, Star } from 'lucide-react';
import { TEMPLATES } from '@/src/config/templates.config';
import { TemplateSkeleton } from './TemplateSkeleton';


interface TemplateShowcaseProps {
  onViewAll: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateShowcase({ onViewAll, onSelectTemplate }: TemplateShowcaseProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-cyan-50 to-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Professional <span className="text-[#088395]">Templates</span>
          </h2>
          <p className="text-xl text-foreground/70">Choose from 900+ expertly designed templates</p>
        </div>

        <div className="relative overflow-hidden">
          <style>{`
            @keyframes scroll-horizontal { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-scroll-horizontal { animation: scroll-horizontal 40s  infinite; }
            .animate-scroll-horizontal:hover { animation-play-state: paused; }
          `}</style>

          <div className="flex gap-6 animate-scroll-horizontal mb-6">
            {[...TEMPLATES, ...TEMPLATES].map((template, index) => (
              <div
                key={`${template.id}-${index}`}
                onClick={() => onSelectTemplate(template.id)}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all flex-shrink-0 w-72"
              >
                {template.popular && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-semibold">Popular</span>
                  </div>
                )}
                {template.isPremium && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#088395] text-white rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    <span className="text-xs font-semibold">Pro</span>
                  </div>
                )}

                <div className="aspect-[8.5/11] bg-gradient-to-br from-cyan-50 to-teal-100 p-4">
                  <TemplateSkeleton id={template.id} />
                </div>

                <div className="p-4 border-t border-gray-100">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-foreground/70 capitalize">{template.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button onClick={onViewAll} className="px-8 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all">
            View All Templates
          </button>
        </div>
      </div>
    </section>
  );
}
