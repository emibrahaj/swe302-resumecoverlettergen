/**
 * templates.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ONLY FILE YOU NEED TO EDIT WHEN ADDING A NEW TEMPLATE.
 *
 * Steps to add a new template:
 *   1. Add an entry to the TEMPLATES array below.
 *   2. Add its live preview renderer to src/components/figma/ResumePreview.tsx
 *
 * Every gallery, carousel, and the CV builder live preview all read from here
 * automatically — no other files need to be touched.
 */

export interface TemplateConfig {
  template_key: string;
  id: string;
  name: string;
  category: 'simple' | 'advanced';
  isPremium: boolean;
  popular?: boolean;
  preview: string; // ADD THIS
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: '1',
    name: 'Modern Minimal',
    category: 'simple',
    isPremium: false,
    popular: true,
    preview: '/templates/template1.png',
    template_key: 'modern_minimal'
  },

  {
    id: '2',
    name: 'Professional Classic',
    category: 'simple',
    isPremium: false,
    preview: '/templates/template2.png',
    template_key: 'professional_classic'
  }
];