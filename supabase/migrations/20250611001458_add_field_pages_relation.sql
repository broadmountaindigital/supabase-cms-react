-- Create table for optional relation from content_fields to site_pages
create table if not exists public.content_field_page_relations (
  id uuid primary key default gen_random_uuid(),
  content_field_id uuid references public.content_fields(id) on delete cascade not null,
  site_page_id uuid references public.site_pages(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  archived_at timestamp with time zone
);

-- Function to get all content fields related to a given page
create or replace function public.get_content_fields_for_page(page_id uuid)
returns setof public.content_fields
language sql
as $$
  select cf.*
  from public.content_fields cf
  join public.content_field_page_relations rel
    on rel.content_field_id = cf.id
  where rel.site_page_id = page_id
    and (rel.archived_at is null)
$$;
