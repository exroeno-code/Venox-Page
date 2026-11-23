-- VEXON accounts: one profile row per signed-up user.
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

-- Row-level security: a person can only ever see and edit their own profile.
alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

drop policy if exists "Owner can read own profile" on public.profiles;
create policy "Owner can read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Owner can update own profile" on public.profiles;
create policy "Owner can update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Creates the profile automatically when someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
        'Vexon member'
      ),
      60
    )
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
