-- Course "Coming Soon" notification sign-ups.
-- Stores one row per email that asked to be notified when new courses launch.
-- The email is unique so the same person can't create duplicate rows, and the
-- table is the source list for future course/newsletter email campaigns.
create table if not exists public.course_notifications (
  id          uuid primary key default gen_random_uuid(),
  email       varchar not null unique,
  notified    boolean not null default false,
  created_at  timestamptz not null default timezone('utc', now())
);

create index if not exists course_notifications_email_idx
  on public.course_notifications (email);
