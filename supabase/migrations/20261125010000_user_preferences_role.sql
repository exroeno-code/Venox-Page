-- VEXVANO LABS onboarding: add role column to user_preferences.
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

-- Add role column with constrained values
alter table public.user_preferences
add column if not exists role text
check (role is null or role in (
  'founder', 'developer', 'business_owner', 'student', 'investor', 'other'
));

-- Backfill existing rows with a default (optional, but keeps data consistent)
-- Only run if you want to set a default for existing users:
-- update public.user_preferences set role = 'other' where role is null;

-- Update the trigger to include role for new users
create or replace function public.handle_new_user_preferences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_preferences (id, onboarding_status)
  values (new.id, 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user_preferences() from public, anon, authenticated;

-- No trigger change needed - it already fires on auth.users insert

-- Add comment for documentation
comment on column public.user_preferences.role is 'User role for tailored experience: founder, developer, business_owner, student, investor, other';