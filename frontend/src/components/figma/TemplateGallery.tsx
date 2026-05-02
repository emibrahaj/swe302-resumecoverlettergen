"use client";
import { ArrowLeft, Sparkles, Star } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'simple' | 'advanced';
  preview: string;
  isPremium: boolean;
  popular?: boolean;
}

const templates: Template[] = [
  { id: '1', name: 'Modern Minimal', category: 'simple', preview: 'modern', isPremium: false, popular: true },
  { id: '2', name: 'Professional Classic', category: 'simple', preview: 'classic', isPremium: false },
  { id: '3', name: 'Creative Bold', category: 'advanced', preview: 'creative', isPremium: false },
  { id: '4', name: 'Executive Elite', category: 'advanced', preview: 'executive', isPremium: true },
  { id: '5', name: 'Tech Innovator', category: 'advanced', preview: 'tech', isPremium: false },
  { id: '6', name: 'Designer Portfolio', category: 'advanced', preview: 'designer', isPremium: true },
  { id: '7', name: 'Academic Scholar', category: 'simple', preview: 'academic', isPremium: false },
  { id: '8', name: 'Startup Founder', category: 'advanced', preview: 'startup', isPremium: true },
  { id: '9', name: 'Minimalist Pro', category: 'simple', preview: 'minimal', isPremium: false },
  { id: '10', name: 'Bold Statement', category: 'advanced', preview: 'bold', isPremium: true },
];

interface TemplateGalleryProps {
  onBack: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateGallery({ onBack, onSelectTemplate }: TemplateGalleryProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your template
          </h1>
          <p className="text-xl text-foreground/70">
            Select from 900+ professionally designed templates
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
            }
            .animate-scroll-horizontal:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="flex gap-6 animate-scroll-horizontal">
          {[...templates, ...templates].map((template, index) => (
            <div
              key={`${template.id}-${index}`}
              className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all flex-shrink-0 w-72"
              onClick={() => onSelectTemplate(template.id)}
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

              <div className="aspect-[8.5/11] bg-gradient-to-br from-cyan-50 to-teal-100 p-6">
                <div className="h-full bg-white rounded shadow-sm p-4 space-y-3">
                  <div className="h-3 bg-[#088395] rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                  <div className="pt-4 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="h-3 bg-[#088395]/70 rounded w-2/3 mt-4"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
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
          <p className="text-foreground/70 mb-4">
            Want more templates? Upgrade to Pro for access to 800+ additional designs
          </p>
          <button className="px-8 py-3 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all">
            View All Pro Templates
          </button>
        </div>
      </div>
    </div>
  );
}
