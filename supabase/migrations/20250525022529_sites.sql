-- Create sites table
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  site_name text not null,
  site_url text not null,
  created_at timestamp with time zone default now()
);

alter table public.sites enable row level security;

-- Policy: Anyone can read site data
create policy "Allow read access to all" on public.sites
  for select
  using (true);

-- Policy: Only the creator can modify site data
create policy "Allow modify access to creator" on public.sites
  for all
  using (auth.uid() = user_id);
