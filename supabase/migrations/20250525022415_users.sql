-- Create user profiles table for Supabase user accounts
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Allow individual user access to their profile" on public.profiles
  for all
  using (auth.uid() = id);
