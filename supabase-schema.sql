-- Run once in Supabase SQL Editor. Row-level security keeps each account's data private.
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "read own progress" on public.user_progress
for select to authenticated using ((select auth.uid()) = user_id);

create policy "insert own progress" on public.user_progress
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "update own progress" on public.user_progress
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.user_progress from anon;
grant select, insert, update on table public.user_progress to authenticated;
