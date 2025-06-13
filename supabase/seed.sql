-- Supabase CMS Seed Data with User and UUIDs

DO $$
DECLARE
  -- Declare variables to hold the generated UUIDs
  site_uuid uuid := gen_random_uuid();
  page_uuid uuid := gen_random_uuid();
  user_uid uuid := gen_random_uuid();
  content_field_uid uuid := gen_random_uuid();
BEGIN

  -- 1. Insert the new user into auth.users
  -- IMPORTANT: This requires elevated privileges and the password must already be hashed.
  INSERT INTO auth.users (id, aud, role, email, encrypted_password)
  VALUES
    (user_uid, 'authenticated', 'authenticated', 'user@usersite.com', '$2a$10$dxg.PQE0nfn9kad0enw.e.f.m.Z.Y.Z.Y.Z.Y.Z.Y.Z.Y.Z.Y.Z.Y');

  -- 2. Create a new site, associating it with the new user
  INSERT INTO public.sites (id, user_id, site_name, site_url)
  VALUES (site_uuid, user_uid, 'Supabase CMS', 'http://localhost:5174');

  -- 3. Grant the new user 'admin' access to the new site
  INSERT INTO public.user_site_access (user_id, site_id, role)
  VALUES (user_uid, site_uuid, 'admin');

  -- 4. Create a new page for that site
  INSERT INTO public.site_pages (id, site_id, page_name)
  VALUES (page_uuid, site_uuid, 'Home');

  -- 5. Create a new content field for that page
  INSERT INTO public.content_fields (id, site_id, field_name, field_value)
  VALUES (content_field_uid, site_uuid, 'some_editable_content', 'This is some editable content. You can change it!');

  INSERT INTO public.content_field_page_relations (content_field_id, site_page_id)
  VALUES (content_field_uid, page_uuid);

END $$;
