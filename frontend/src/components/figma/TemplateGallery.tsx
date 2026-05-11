"use client";

import { Sparkles, Star } from 'lucide-react';
import { TEMPLATES } from '@/src/config/templates.config';
import { TemplateSkeleton } from './TemplateSkeleton';


interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  onViewAll: () => void;
}

export function TemplateGallery({ onSelectTemplate, onViewAll }: TemplateGalleryProps) {
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

                <div className="absolute inset-0 bg-gradient-to-t from-[#088395]/90 to-teal-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold">
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
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
