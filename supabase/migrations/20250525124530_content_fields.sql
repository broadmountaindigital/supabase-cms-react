CREATE TABLE content_fields (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid references public.sites(id) on delete cascade,
    field_name text NOT NULL,
    field_value text,
    field_namespace text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

alter table public.content_fields enable row level security;

-- Policy: Anyone can read content field data
create policy "Allow read access to all" on public.content_fields
  for select
  using (true);

-- Policy: Only the creator of the related site can modify content field data
create policy "Allow modify access to site creator" on public.content_fields
  for all
  using (
    exists (
      select 1 from public.sites s
      where s.id = site_id and auth.uid() = s.user_id
    )
  );
