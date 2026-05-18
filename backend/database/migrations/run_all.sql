-- run_all.sql
-- Combined migrations for one-click application in the Supabase SQL editor.
-- Safe to run multiple times (every statement uses IF NOT EXISTS).

-- ====== 001_paypal.sql ======
alter table public.payments
  add column if not exists paypal_order_id text unique,
  add column if not exists paypal_subscription_id text,
  add column if not exists paypal_capture_id text,
  add column if not exists provider text default 'paypal';

create index if not exists idx_payments_paypal_subscription_id
  on public.payments (paypal_subscription_id);

-- ====== 002_subscriptions.sql ======
alter table public.subscriptions
  add column if not exists paypal_subscription_id text unique,
  add column if not exists paypal_plan_id text,
  add column if not exists cancel_at timestamptz,
  add column if not exists last_payment_at timestamptz;

create index if not exists idx_subscriptions_user_id
  on public.subscriptions (user_id);

-- ====== 003_skill_matrix.sql ======
alter table public.resume_feedback
  add column if not exists experience_score integer check (experience_score is null or (experience_score >= 0 and experience_score <= 100)),
  add column if not exists education_score integer check (education_score is null or (education_score >= 0 and education_score <= 100)),
  add column if not exists technical_skills_score integer check (technical_skills_score is null or (technical_skills_score >= 0 and technical_skills_score <= 100)),
  add column if not exists soft_skills_score integer check (soft_skills_score is null or (soft_skills_score >= 0 and soft_skills_score <= 100)),
  add column if not exists achievements_score integer check (achievements_score is null or (achievements_score >= 0 and achievements_score <= 100)),
  add column if not exists keywords_score integer check (keywords_score is null or (keywords_score >= 0 and keywords_score <= 100)),
  add column if not exists job_relevance_score integer check (job_relevance_score is null or (job_relevance_score >= 0 and job_relevance_score <= 100)),
  add column if not exists dimensions jsonb;

create index if not exists idx_resume_feedback_resume_id
  on public.resume_feedback (resume_id);

-- ====== 004_paypal_webhooks.sql ======
create table if not exists public.paypal_webhooks (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz default now(),
  status text default 'received'
);

create index if not exists idx_paypal_webhooks_event_type
  on public.paypal_webhooks (event_type);

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
