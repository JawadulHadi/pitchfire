-- Migration 007: Replace Stripe with JazzCash + add job board integrations

-- ─── Users: swap Stripe columns for JazzCash payment tracking ───────────────

ALTER TABLE public.users
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  ADD COLUMN IF NOT EXISTS jazzcash_txn_ref   text,
  ADD COLUMN IF NOT EXISTS last_payment_at     timestamptz;

-- ─── Job board integrations ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_board_integrations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  board          text not null check (board in ('linkedin','indeed','glassdoor','workday','workable','rozee','mustakbil')),
  access_token   text,
  refresh_token  text,
  token_expires_at timestamptz,
  is_active      boolean not null default true,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  UNIQUE (user_id, board)
);

ALTER TABLE public.job_board_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_board_own_data" ON public.job_board_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_board_user
  ON public.job_board_integrations (user_id, board);

-- ─── Job listings: add source board + apply_url columns ──────────────────────
-- Note: board and external_id already exist in the schema (added in earlier migrations)

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS source_board  text check (source_board in ('linkedin','indeed','glassdoor','workday','workable','rozee','mustakbil','manual')),
  ADD COLUMN IF NOT EXISTS apply_url     text;

CREATE INDEX IF NOT EXISTS idx_job_listings_source
  ON public.job_listings (source_board, scraped_at DESC)
  WHERE source_board IS NOT NULL;
