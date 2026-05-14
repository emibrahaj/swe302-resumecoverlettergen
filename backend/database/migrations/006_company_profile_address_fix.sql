-- Fix company profile persistence.
-- Supabase production schema uses address, while older local code used company_address.

alter table public.company_profiles
  add column if not exists address text;

-- If an older local/dev database has company_address, copy its data into address.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'company_profiles'
      and column_name = 'company_address'
  ) then
    execute 'update public.company_profiles set address = coalesce(address, company_address)';
  end if;
end $$;
