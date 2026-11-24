-- AI assistant concept feedback. Public visitors may submit but cannot read or edit rows.
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Review submissions in Dashboard > Table Editor > assistant_feedback.

create table if not exists public.assistant_feedback (
  id uuid primary key default gen_random_uuid(),
  problem text not null check (char_length(btrim(problem)) between 1 and 1000),
  current_approach text not null check (char_length(btrim(current_approach)) between 1 and 1000),
  useful_result text not null check (char_length(btrim(useful_result)) between 1 and 1000),
  email text check (email is null or (char_length(email) between 5 and 254 and position('@' in email) > 1)),
  created_at timestamptz not null default now()
);

alter table public.assistant_feedback enable row level security;
revoke all on public.assistant_feedback from anon;
revoke all on public.assistant_feedback from authenticated;
grant insert (problem, current_approach, useful_result, email) on public.assistant_feedback to anon, authenticated;

drop policy if exists "Anyone can submit assistant feedback" on public.assistant_feedback;
create policy "Anyone can submit assistant feedback"
  on public.assistant_feedback for insert to anon, authenticated
  with check (true);
