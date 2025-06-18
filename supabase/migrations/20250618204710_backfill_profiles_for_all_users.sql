-- Migration: Backfill profiles for all users in auth.users

insert into profiles (id, full_name, avatar_url)
select id, email, null from auth.users
where not exists (select 1 from profiles where profiles.id = auth.users.id);
