-- Run this once in Supabase SQL Editor.
-- It makes sure the profile + detailed job columns used by the backend/frontend exist.

alter table public.company_profiles
  add column if not exists address text;

alter table public.job_posting
  add column if not exists salary text,
  add column if not exists job_location text,
  add column if not exists employment_type text,
  add column if not exists description text;

create index if not exists idx_job_posting_company_id
  on public.job_posting (company_id);

create index if not exists idx_job_posting_is_active
  on public.job_posting (is_active);
