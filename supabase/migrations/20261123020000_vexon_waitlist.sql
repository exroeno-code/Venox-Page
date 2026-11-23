-- VEXON waitlist: email sign-ups for the AI assistant concept (/assistant page).
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Read sign-ups in Dashboard > Table Editor > waitlist.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (
    char_length(email) between 5 and 254 and email = lower(email) and position('@' in email) > 1
  ),
  name text check (name is null or char_length(btrim(name)) between 1 and 80),
  topic text not null default 'ai-assistant' check (topic in ('ai-assistant')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (email, topic)
);

alter table public.waitlist enable row level security;

-- Visitors can join; nobody can read the list through the public API.
revoke all on public.waitlist from anon;
revoke all on public.waitlist from authenticated;
grant insert (email, name, topic, user_id) on public.waitlist to anon, authenticated;

drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
