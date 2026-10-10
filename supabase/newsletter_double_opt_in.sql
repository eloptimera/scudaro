-- Run once in the Scudaro Supabase project: SQL Editor → New query → paste → Run.
-- Adds what double opt-in needs and keeps proof of consent. Existing rows are untouched (their columns stay NULL).
alter table public.newsletter_leads
  add column if not exists token           text,
  add column if not exists locale          text,
  add column if not exists consent_text    text,
  add column if not exists consent_at      timestamptz,
  add column if not exists confirmed_at    timestamptz,
  add column if not exists unsubscribed_at timestamptz;

create unique index if not exists newsletter_leads_token_key on public.newsletter_leads (token) where token is not null;
-- RLS stays on with no public policies: only the server (secret key) reads or writes this table.
