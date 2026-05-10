/**
 * templates.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ONLY FILE YOU NEED TO EDIT WHEN ADDING A NEW TEMPLATE.
 *
 * Steps to add a new template:
 *   1. Add an entry to the TEMPLATES array below.
 *   2. Add its skeleton preview to src/components/figma/TemplateSkeleton.tsx
 *   3. Add its live preview renderer to src/components/figma/ResumePreview.tsx
 *
 * Every gallery, carousel, and the CV builder live preview all read from here
 * automatically — no other files need to be touched.
 */

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'simple' | 'advanced';
  isPremium: boolean;
  popular?: boolean;
}

export const TEMPLATES: TemplateConfig[] = [
  { id: '1',  name: 'Modern Minimal',       category: 'simple',   isPremium: false, popular: true },
  { id: '2',  name: 'Professional Classic', category: 'simple',   isPremium: false },
  { id: '3',  name: 'Creative Bold',        category: 'advanced', isPremium: false },
  { id: '4',  name: 'Executive Elite',      category: 'advanced', isPremium: true  },
  { id: '5',  name: 'Tech Innovator',       category: 'advanced', isPremium: false },
  { id: '6',  name: 'Designer Portfolio',   category: 'advanced', isPremium: true  },
  { id: '7',  name: 'Academic Scholar',     category: 'simple',   isPremium: false },
  { id: '8',  name: 'Startup Founder',      category: 'advanced', isPremium: true  },
  { id: '9',  name: 'Minimalist Pro',       category: 'simple',   isPremium: false },
  { id: '10', name: 'Bold Statement',       category: 'advanced', isPremium: true  },
  // ↓ Add new templates here
];
