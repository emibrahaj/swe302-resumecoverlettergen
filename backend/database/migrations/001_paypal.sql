-- 001_paypal.sql
-- Add PayPal columns to the payments table (additive, all nullable so existing rows are unaffected).

alter table public.payments
  add column if not exists paypal_order_id text unique,
  add column if not exists paypal_subscription_id text,
  add column if not exists paypal_capture_id text,
  add column if not exists provider text default 'paypal';

create index if not exists idx_payments_paypal_subscription_id
  on public.payments (paypal_subscription_id);
