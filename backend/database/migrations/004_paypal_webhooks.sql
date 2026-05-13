-- 004_paypal_webhooks.sql
-- Idempotency table for PayPal webhook deliveries (so duplicate events are no-ops).

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
