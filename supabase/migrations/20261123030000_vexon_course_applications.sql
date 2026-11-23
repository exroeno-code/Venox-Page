-- VEXON learning: applications sent from the /learning page.
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Read applications in Dashboard > Table Editor > course_applications.

create table if not exists public.course_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text not null check (char_length(email) between 5 and 254 and email = lower(email) and position('@' in email) > 1),
  phone text not null check (char_length(phone) between 9 and 16),
  level text not null check (level in ('degree', 'diploma', 'certificate')),
  programme text not null check (char_length(programme) between 3 and 200),
  note text check (note is null or char_length(btrim(note)) between 1 and 1000),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.course_applications enable row level security;

-- Visitors (signed in or not) can apply, and nobody can read applications back through the
-- public API. Only you, in the Supabase dashboard (or with the service_role key on a server).
revoke all on public.course_applications from anon;
revoke all on public.course_applications from authenticated;
grant insert (name, email, phone, level, programme, note, user_id) on public.course_applications to anon, authenticated;

drop policy if exists "Anyone can apply" on public.course_applications;
create policy "Anyone can apply"
  on public.course_applications for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
