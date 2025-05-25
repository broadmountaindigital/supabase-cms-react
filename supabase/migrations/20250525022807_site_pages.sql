-- Create site_pages table
create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  page_name text not null,
  page_description text,
  page_title text,
  created_at timestamp with time zone default now()
);

alter table public.site_pages enable row level security;

-- Policy: Anyone can read site page data
create policy "Allow read access to all" on public.site_pages
  for select
  using (true);

-- Policy: Only the creator of the related site can modify site page data
create policy "Allow modify access to site creator" on public.site_pages
  for all
  using (
    exists (
      select 1 from public.sites s
      where s.id = site_id and auth.uid() = s.user_id
    )
  );
