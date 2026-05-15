-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Add template_key column to templates table
-- and seed the 10 built-in templates that match the React components in
-- ResumePreview.tsx (T1…T10 via keys "template1"…"template10").
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the column (idempotent via IF NOT EXISTS)
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS template_key text UNIQUE;

-- 2. Seed the 10 built-in templates
--    style_config.templateKey  →  maps to the React component in ResumePreview.tsx
--    style_config.primaryColor →  default accent colour the CVBuilder will pick up
INSERT INTO public.templates (name, type, template_key, preview_image_url, style_config, is_premium)
VALUES
  ('Modern Minimal',        'simple',   'modern_minimal',        NULL, '{"templateKey":"template1","primaryColor":"#088395","fontFamily":"Inter"}',      false),
  ('Professional Classic',  'simple',   'professional_classic',  NULL, '{"templateKey":"template2","primaryColor":"#088395","fontFamily":"Inter"}',      false),
  ('Creative Bold',         'advanced', 'creative_bold',         NULL, '{"templateKey":"template3","primaryColor":"#6366f1","fontFamily":"Montserrat"}', false),
  ('Executive Elite',       'advanced', 'executive_elite',       NULL, '{"templateKey":"template4","primaryColor":"#1e293b","fontFamily":"Inter"}',      true),
  ('Tech Innovator',        'advanced', 'tech_innovator',        NULL, '{"templateKey":"template5","primaryColor":"#10b981","fontFamily":"Roboto"}',     false),
  ('Designer Portfolio',    'advanced', 'designer_portfolio',    NULL, '{"templateKey":"template6","primaryColor":"#8b5cf6","fontFamily":"Montserrat"}', true),
  ('Academic Scholar',      'simple',   'academic_scholar',      NULL, '{"templateKey":"template7","primaryColor":"#374151","fontFamily":"Open Sans"}', false),
  ('Startup Founder',       'advanced', 'startup_founder',       NULL, '{"templateKey":"template8","primaryColor":"#ec4899","fontFamily":"Inter"}',     true),
  ('Minimalist Pro',        'simple',   'minimalist_pro',        NULL, '{"templateKey":"template9","primaryColor":"#111827","fontFamily":"Inter"}',     false),
  ('Bold Statement',        'advanced', 'bold_statement',        NULL, '{"templateKey":"template10","primaryColor":"#f59e0b","fontFamily":"Montserrat"}',true)
ON CONFLICT (template_key) DO NOTHING;