-- Create enum for user-site roles
create type public.user_site_role as enum ('author', 'editor', 'admin');

-- Create user_site_access table
create table if not exists public.user_site_access (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role public.user_site_role not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (site_id, user_id)
);

alter table public.user_site_access enable row level security;

-- Policy: Anyone can read user_site_access data
create policy "Allow read access to all" on public.user_site_access
  for select
  using (true);

-- Policy: Only the site owner can grant/revoke access
create policy "Allow modify access to site owner" on public.user_site_access
  for all
  using (
    exists (
      select 1 from public.sites s
      where s.id = site_id and auth.uid() = s.user_id
    )
  );
