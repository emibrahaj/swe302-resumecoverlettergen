-- 000_fresh_setup.sql
-- Complete one-shot setup script for a new Supabase project.
-- Idempotent: every statement uses IF NOT EXISTS.
-- Tables are created in dependency order to satisfy foreign keys.
--
-- After running this, the four additive migrations (001-004) are already included
-- at the bottom — no separate step needed.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ======================================================================
-- 1. Identity layer (mirrors auth.users)
-- ======================================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name varchar,
  email varchar not null unique,
  role text default 'user',
  company_id uuid,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  tier text default 'free',
  created_at timestamptz default now()
);

create table if not exists public.companies (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  company_name text not null,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.company_profiles (
  id uuid primary key references public.companies(id) on delete cascade,
  company_name text not null,
  company_website text,
  logo_url text,
  email text not null unique,
  description text,
  company_id uuid,
  created_at timestamptz default now()
);

-- ======================================================================
-- 2. Templates catalog
-- ======================================================================

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  preview_image_url text,
  style_config jsonb not null default '{}'::jsonb,
  is_premium boolean default false,
  created_at timestamptz default timezone('utc', now())
);

-- Seed 14 templates if catalog is empty (matches the files in templates/)
insert into public.templates (name, type, style_config, is_premium)
select v.name, v.type, v.style_config::jsonb, v.is_premium
from (values
  ('Modern Yellow',         'modern',     '{"file":"template_1.html","accent":"#f5c518"}',  false),
  ('Professional Classic',  'classic',    '{"file":"template_2.html"}',                       false),
  ('Creative Bold',         'creative',   '{"file":"template_3.html","accent":"#088395"}',  false),
  ('Executive Elite',       'executive',  '{"file":"template_4.html"}',                       true),
  ('Tech Innovator',        'tech',       '{"file":"template_5.html"}',                       false),
  ('Designer Portfolio',    'design',     '{"file":"template_6.html"}',                       true),
  ('Light Mint Card',       'modern',     '{"file":"template_7.html","accent":"#10b981"}',  false),
  ('Startup Founder',       'modern',     '{"file":"template_8.html"}',                       true),
  ('Minimalist Pro',        'minimal',    '{"file":"template_9.html"}',                       false),
  ('Bold Statement',        'creative',   '{"file":"template_10.html"}',                      true),
  ('Academic Scholar',      'academic',   '{"file":"template_11.html"}',                      false),
  ('Corporate Blue',        'classic',    '{"file":"template_12.html"}',                      false),
  ('Two-Column Clean',      'modern',     '{"file":"template_13.html"}',                      false),
  ('Terracotta Serif',      'creative',   '{"file":"template_14.html","accent":"#c0532f"}',  true)
) as v(name, type, style_config, is_premium)
where not exists (select 1 from public.templates);

-- ======================================================================
-- 3. Resumes & cover letters
-- ======================================================================

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  raw_content jsonb,
  polished_content jsonb,
  target_job_title text,
  premium_analysis boolean default false,
  template_id uuid references public.templates(id),
  temp_token uuid default gen_random_uuid(),
  ai_market_insights jsonb,
  ai_learning_recommendations jsonb,
  last_analysis_id uuid,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  title varchar,
  content text,
  type text,
  job_position varchar,
  created_at timestamptz default timezone('utc', now())
);

-- ======================================================================
-- 4. Jobs & matches
-- ======================================================================

create table if not exists public.job_posting (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  company_name text,
  job_title text,
  required_skills text[] default array[]::text[],
  salary text,
  job_location text,
  employment_type text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_id uuid references public.job_posting(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  cover_letter_id uuid references public.cover_letters(id) on delete set null,
  match_score double precision not null,
  status text default 'matched',
  created_at timestamptz default now()
);

create table if not exists public.job_invitations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_posting(id) on delete cascade,
  candidate_id uuid references public.user_profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ======================================================================
-- 5. AI analysis tables
-- ======================================================================

create table if not exists public.market_insights_cache (
  id uuid primary key default gen_random_uuid(),
  job_title text not null default '',
  company_name text,
  search_query text unique,
  raw_scraps jsonb,
  key_skills text[] default array[]::text[],
  last_updated timestamptz default now()
);

create table if not exists public.resume_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  overall_score integer check (overall_score is null or (overall_score >= 0 and overall_score <= 100)),
  content_score integer,
  formatting_score integer,
  ats_compatibility_score integer,
  suggestions jsonb,
  critical_fixes text[],
  learning_path jsonb,
  skill_gaps text[],
  created_at timestamptz default now()
);

alter table public.resumes
  add constraint if not exists resumes_last_analysis_id_fkey
  foreign key (last_analysis_id) references public.resume_feedback(id);

create table if not exists public.competitor_profiles (
  id uuid primary key default gen_random_uuid(),
  job_analysis_id uuid,
  source text,
  extracted_data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.job_analysis (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete cascade,
  output_score integer,
  top_missing_skills text[],
  top_advice text[],
  competitor_profiles_id uuid references public.competitor_profiles(id),
  created_at timestamptz default now()
);

-- back-fill the FK from competitor_profiles -> job_analysis (created earlier)
alter table public.competitor_profiles
  add constraint if not exists competitor_profiles_job_analysis_id_fkey
  foreign key (job_analysis_id) references public.job_analysis(id) on delete cascade;

create table if not exists public.analysis_metrics (
  id uuid primary key default gen_random_uuid(),
  job_analysis_id uuid references public.job_analysis(id) on delete cascade,
  metric_name text,
  user_score double precision,
  benchmark_score double precision
);

create table if not exists public.user_analysis_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete cascade,
  match_score integer,
  skill_gap_analysis jsonb,
  cv_embedding_id uuid,
  created_at timestamptz default now()
);

-- ======================================================================
-- 6. Courses (recommendations from skill gaps)
-- ======================================================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text,
  skill_category text,
  affiliate_link text,
  discount_code text default 'RESUME10'
);

create table if not exists public.course_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  used_at timestamptz default now()
);

-- Seed a handful of placeholder courses so the recommendations UI is non-empty
insert into public.courses (title, skill_category, affiliate_link)
select v.title, v.skill_category, v.affiliate_link
from (values
  ('Python for Data Science', 'python', 'https://www.coursera.org/learn/python'),
  ('Advanced React Patterns', 'react', 'https://www.coursera.org/learn/react'),
  ('AWS Cloud Practitioner Essentials', 'aws', 'https://www.aws.training/'),
  ('SQL for Data Analysis', 'sql', 'https://www.coursera.org/learn/sql'),
  ('Machine Learning Foundations', 'machine learning', 'https://www.coursera.org/learn/machine-learning'),
  ('Project Management Professional Prep', 'project management', 'https://www.coursera.org/learn/pmp'),
  ('Effective Communication for Engineers', 'communication', 'https://www.coursera.org/learn/communication')
) as v(title, skill_category, affiliate_link)
where not exists (select 1 from public.courses);

-- ======================================================================
-- 7. Subscriptions & payments  (includes 001 + 002 + 004 migrations)
-- ======================================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  plan text not null,
  status text not null,
  price numeric,
  start_date timestamptz default now(),
  end_date timestamptz,
  paypal_subscription_id text unique,
  paypal_plan_id text,
  cancel_at timestamptz,
  last_payment_at timestamptz
);

create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  stripe_payment_intent_id text unique,
  paypal_order_id text unique,
  paypal_subscription_id text,
  paypal_capture_id text,
  provider text default 'paypal',
  status text not null,
  created_at timestamptz default now()
);

create index if not exists idx_payments_paypal_subscription_id
  on public.payments (paypal_subscription_id);

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

-- ======================================================================
-- 8. Skill matrix columns on resume_feedback  (migration 003)
-- ======================================================================

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

-- ======================================================================
-- 9. Helper triggers to auto-populate users/user_profiles on signup
-- ======================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
    on conflict (id) do nothing;

  insert into public.user_profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
    on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
