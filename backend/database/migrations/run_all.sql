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

-- ====== 005_job_posting_details.sql ======
alter table public.job_posting
  add column if not exists salary text,
  add column if not exists job_location text,
  add column if not exists employment_type text,
  add column if not exists description text;

create index if not exists idx_job_posting_company_id
  on public.job_posting (company_id);

create index if not exists idx_job_posting_is_active
  on public.job_posting (is_active);
