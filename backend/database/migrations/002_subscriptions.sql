-- 002_subscriptions.sql
-- Add PayPal Subscription tracking columns. Additive, all nullable.

alter table public.subscriptions
  add column if not exists paypal_subscription_id text unique,
  add column if not exists paypal_plan_id text,
  add column if not exists cancel_at timestamptz,
  add column if not exists last_payment_at timestamptz;

create index if not exists idx_subscriptions_user_id
  on public.subscriptions (user_id);
