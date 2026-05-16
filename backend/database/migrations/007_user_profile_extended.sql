-- 007: Extend user_profiles with editable profile fields
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS phone            text,
  ADD COLUMN IF NOT EXISTS location         text,
  ADD COLUMN IF NOT EXISTS current_title    text,
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS education        text,
  ADD COLUMN IF NOT EXISTS skills           text,
  ADD COLUMN IF NOT EXISTS linkedin_url     text,
  ADD COLUMN IF NOT EXISTS portfolio_url    text,
  ADD COLUMN IF NOT EXISTS bio              text;

-- 007: Add location to user_profiles for future job filtering
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS location text;