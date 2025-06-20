-- Supabase CMS Seed Data with User and UUIDs
--
-- Default credentials:
-- Email: user@usersite.com
-- Password: passMconsul4user

CREATE OR REPLACE FUNCTION public.create_user(
    email text,
    password text
) RETURNS uuid AS $$
  declare
  user_id uuid;
  encrypted_pw text;
BEGIN
  user_id := gen_random_uuid();
  encrypted_pw := crypt(password, gen_salt('bf'));

  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, '2023-05-03 19:41:43.585805+00', '2023-04-22 13:10:03.275387+00', '2023-04-22 13:10:31.458239+00', '{"provider":"email","providers":["email"]}', '{}', '2023-05-03 19:41:43.580424+00', '2023-05-03 19:41:43.585948+00', '', '', '', '');

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', user_id, '2023-05-03 19:41:43.582456+00', '2023-05-03 19:41:43.582497+00', '2023-05-03 19:41:43.582497+00');

  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  -- Declare variables to hold the generated UUIDs
  site_uuid uuid := '58ee3f3c-c843-4351-89e7-7e75f8aa3bef';
  page_uuid uuid := gen_random_uuid();
  user_uid uuid := create_user('user@usersite.com', 'passMconsul4user');
  content_field_uid uuid := gen_random_uuid();
BEGIN

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
