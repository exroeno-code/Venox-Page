-- Profile pictures: an avatar_url on each profile, filled from Google on sign-up or uploaded by the member.

alter table public.profiles add column if not exists avatar_url text
  check (avatar_url is null or char_length(avatar_url) <= 1024);

grant update (avatar_url) on public.profiles to authenticated;

-- New sign-ups (email or Google) get their name and Google picture automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
        'Vexvano Labs member'
      ),
      60
    ),
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
      ),
      1024
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Public bucket for avatars. Each member may only write inside their own folder: <user id>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members upload own avatar" on storage.objects;
create policy "Members upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members update own avatar" on storage.objects;
create policy "Members update own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members delete own avatar" on storage.objects;
create policy "Members delete own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
