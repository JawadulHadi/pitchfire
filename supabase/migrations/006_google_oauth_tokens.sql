-- Migration 006: per-user Google OAuth token storage
-- Stores Gmail + Calendar access/refresh tokens per user.
-- AuthService reads/writes this table; tokens auto-refresh on expiry.

create table if not exists public.user_google_tokens (
  user_id       uuid        primary key references public.users(id) on delete cascade,
  access_token  text        not null,
  refresh_token text,
  expiry_date   bigint,                        -- Unix ms
  scope         text,
  updated_at    timestamptz not null default now()
);

-- Only the owning user can read their own tokens.
alter table public.user_google_tokens enable row level security;

create policy "owner read"  on public.user_google_tokens
  for select using (auth.uid() = user_id);

-- Service role bypasses RLS — used by AuthService.
