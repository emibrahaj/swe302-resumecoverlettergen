-- Adds company job-posting detail fields used by the company dashboard/profile CRUD.
-- Safe to run multiple times in Supabase SQL Editor.

alter table public.job_posting
  add column if not exists salary text,
  add column if not exists job_location text,
  add column if not exists employment_type text,
  add column if not exists description text;

create index if not exists idx_job_posting_company_id
  on public.job_posting (company_id);

create index if not exists idx_job_posting_is_active
  on public.job_posting (is_active);
