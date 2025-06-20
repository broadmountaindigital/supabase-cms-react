-- Migration: Automatically create a profile for every new user

-- Create the trigger function
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.email, null)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();
