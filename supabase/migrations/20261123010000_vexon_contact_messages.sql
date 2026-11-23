-- VEXON contact form: messages sent from the /contact page.
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Read the messages in Dashboard > Table Editor > contact_messages.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text not null check (char_length(email) between 5 and 254 and position('@' in email) > 1),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Visitors (signed in or not) can send a message, and nobody can read them back through the
-- public API. Only you, in the Supabase dashboard (or with the service_role key on a server).
revoke all on public.contact_messages from anon;
revoke all on public.contact_messages from authenticated;
grant insert (name, email, message, user_id) on public.contact_messages to anon, authenticated;

drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message"
  on public.contact_messages for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
