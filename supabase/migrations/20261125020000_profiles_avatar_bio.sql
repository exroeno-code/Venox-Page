-- VEXON profiles: add avatar_url, bio, and social_links columns.
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

alter table public.profiles
add column if not exists avatar_url text,
add column if not exists bio text check (bio is null or char_length(btrim(bio)) <= 500),
add column if not exists social_links jsonb not null default '{}';

-- Update RLS policies to allow users to update their new columns
drop policy if exists "Owner can update own profile" on public.profiles;
create policy "Owner can update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Storage bucket for avatars (run in Supabase Dashboard > Storage or via SQL)
-- This bucket must be created manually or via Supabase CLI:
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
--
-- Storage RLS policies for avatars bucket:
-- create policy "Anyone can view avatars" on storage.objects for select using (bucket_id = 'avatars');
-- create policy "Users can upload own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users can update own avatar" on storage.objects for update to authenticated using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users can delete own avatar" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

comment on column public.profiles.avatar_url is 'Public URL to user avatar in Supabase Storage avatars bucket';
comment on column public.profiles.bio is 'User biography, max 500 chars';
comment on column public.profiles.social_links is 'JSON object with social links: {github, linkedin, twitter, website}';