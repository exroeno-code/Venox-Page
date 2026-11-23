-- Optional VEXON TECH website onboarding/preferences.
-- Existing accounts are marked completed so this migration does not interrupt returning users.
-- New auth.users rows receive a pending preferences row through the trigger below.

create table if not exists public.user_preferences (
  id uuid primary key references auth.users (id) on delete cascade,
  owns_business text check (owns_business is null or owns_business in ('yes', 'no', 'prefer_not_to_say')),
  business_type text check (
    business_type is null or business_type in (
      'retail', 'food_hospitality', 'professional_services', 'education_training',
      'technology', 'agriculture', 'manufacturing', 'other'
    )
  ),
  business_type_other text check (business_type_other is null or char_length(btrim(business_type_other)) <= 100),
  help_topics text[] not null default '{}',
  help_other text check (help_other is null or char_length(btrim(help_other)) <= 100),
  description text check (description is null or char_length(btrim(description)) <= 500),
  onboarding_status text not null default 'pending'
    check (onboarding_status in ('pending', 'skipped', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_topics_allowed check (
    array_position(help_topics, null) is null and
    help_topics <@ array[
      'digital_tools', 'online_presence', 'business_training',
      'computing_classes', 'responsible_goods_trade', 'other'
    ]::text[]
  ),
  constraint user_preferences_business_details_consistent check (
    owns_business is not distinct from 'yes' or (business_type is null and business_type_other is null)
  ),
  constraint user_preferences_other_business_type check (
    business_type is not distinct from 'other' or business_type_other is null
  ),
  constraint user_preferences_other_help check (
    'other' = any(help_topics) or help_other is null
  )
);

alter table public.user_preferences enable row level security;
revoke all on public.user_preferences from anon;
revoke all on public.user_preferences from authenticated;
grant select on public.user_preferences to authenticated;
grant insert (id, owns_business, business_type, business_type_other, help_topics, help_other, description, onboarding_status)
  on public.user_preferences to authenticated;
grant update (owns_business, business_type, business_type_other, help_topics, help_other, description, onboarding_status)
  on public.user_preferences to authenticated;

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences"
  on public.user_preferences for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences"
  on public.user_preferences for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
  on public.user_preferences for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.touch_user_preferences_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.touch_user_preferences_updated_at() from public, anon, authenticated;

drop trigger if exists user_preferences_updated_at on public.user_preferences;
create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.touch_user_preferences_updated_at();

-- Preserve seamless sign-in for existing users: they are not first-time accounts.
insert into public.user_preferences (id, onboarding_status)
select id, 'completed'
from auth.users
on conflict (id) do nothing;

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

drop trigger if exists on_auth_user_created_preferences on auth.users;
create trigger on_auth_user_created_preferences
  after insert on auth.users
  for each row execute function public.handle_new_user_preferences();
