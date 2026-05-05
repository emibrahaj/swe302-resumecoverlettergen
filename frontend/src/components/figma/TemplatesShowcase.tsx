"use client";

import { Sparkles, Star } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: "simple" | "advanced";
  preview: string;
  isPremium: boolean;
  popular?: boolean;
}

interface TemplatesShowcaseProps {
  onSelectTemplate: (templateId: string) => void;
}

const templates: Template[] = [
  {
    id: "1",
    name: "Modern Minimal",
    category: "simple",
    preview: "modern",
    isPremium: false,
    popular: true,
  },
  {
    id: "2",
    name: "Professional Classic",
    category: "simple",
    preview: "classic",
    isPremium: false,
  },
  {
    id: "3",
    name: "Creative Bold",
    category: "advanced",
    preview: "creative",
    isPremium: false,
  },
  {
    id: "4",
    name: "Executive Elite",
    category: "advanced",
    preview: "executive",
    isPremium: true,
  },
  {
    id: "5",
    name: "Tech Innovator",
    category: "advanced",
    preview: "tech",
    isPremium: false,
  },
  {
    id: "6",
    name: "Designer Portfolio",
    category: "advanced",
    preview: "designer",
    isPremium: true,
  },
  {
    id: "7",
    name: "Academic Scholar",
    category: "simple",
    preview: "academic",
    isPremium: false,
  },
  {
    id: "8",
    name: "Startup Founder",
    category: "advanced",
    preview: "startup",
    isPremium: true,
  },
  {
    id: "9",
    name: "Minimalist Pro",
    category: "simple",
    preview: "minimal",
    isPremium: false,
  },
  {
    id: "10",
    name: "Bold Statement",
    category: "advanced",
    preview: "bold",
    isPremium: true,
  },
];

export function TemplatesShowcase({ onSelectTemplate }: TemplatesShowcaseProps) {
  return (
    <section
      id="templates"
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-8 py-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Choose your template
              </h1>
              <p className="text-white/90">
                Select from 900+ professionally designed templates
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
            >
              {template.popular && (
                <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  <span className="text-xs font-semibold">Popular</span>
                </div>
              )}

              {template.isPremium && (
                <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-[#088395] text-white rounded-full flex items-center gap-1">
                  <Sparkles size={10} />
                  <span className="text-xs font-semibold">Pro</span>
                </div>
              )}

              <div className="aspect-[8.5/11] bg-gradient-to-br from-cyan-50 to-teal-100 p-4">
                <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
                  <div className="h-2 bg-[#088395] rounded w-3/4"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-1/2"></div>

                  <div className="pt-3 space-y-1.5">
                    <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-1.5 bg-gray-200 rounded w-4/6"></div>
                  </div>

                  <div className="h-2 bg-[#088395]/70 rounded w-2/3 mt-3"></div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-gray-100">
                <h3 className="font-semibold text-sm mb-1">
                  {template.name}
                </h3>
                <p className="text-xs text-foreground/70 capitalize">
                  {template.category}
                </p>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#088395]/90 to-teal-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  className="px-4 py-2 bg-white text-[#088395] rounded-lg font-semibold text-sm"
                >
                  Use This Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}