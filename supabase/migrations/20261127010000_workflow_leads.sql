-- VEXVANO LABS AI Workflow Sprint enquiries.
-- Visitors may submit, but no public role may read these records.
create table if not exists public.workflow_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  business text not null check (char_length(btrim(business)) between 2 and 120),
  phone text not null check (char_length(phone) between 9 and 16),
  email text check (email is null or char_length(email) between 5 and 255),
  task text not null check (char_length(btrim(task)) between 5 and 1000),
  package text not null check (package in ('AI Workflow Audit', 'AI Workflow Sprint', 'Team Package', 'Not sure yet')),
  source text
);

alter table public.workflow_leads enable row level security;
revoke all on public.workflow_leads from anon;
revoke all on public.workflow_leads from authenticated;
grant insert (name, business, phone, email, task, package, source) on public.workflow_leads to anon, authenticated;
grant all on public.workflow_leads to service_role;
drop policy if exists "Anyone can submit a workflow lead" on public.workflow_leads;
create policy "Anyone can submit a workflow lead"
  on public.workflow_leads for insert to anon, authenticated
  with check (true);
