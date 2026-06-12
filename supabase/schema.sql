-- Cosmic Closet — Supabase schema
-- Run this once in your Supabase project: SQL Editor → paste → Run.

-- 1) Profiles: one row per user, keyed to the auth user id.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sign text,
  sex text,
  zip text,
  age text,
  updated_at timestamptz default now()
);

-- 2) Fit log: one row per user per day.
create table if not exists public.fit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  wore boolean default false,
  fit text,
  note text,
  avatar jsonb,
  prefs jsonb,
  unique (user_id, date)
);

create index if not exists fit_log_user_date_idx on public.fit_log (user_id, date desc);

-- 3) Row Level Security: each user can only read/write their own rows.
alter table public.profiles enable row level security;
alter table public.fit_log enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own fit_log" on public.fit_log;
create policy "own fit_log" on public.fit_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
