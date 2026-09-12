-- =============================================================================
-- EVORA GIFTING — auto-create a `profiles` row for every new Supabase auth user
-- =============================================================================
-- Keeps `public.profiles` in sync with `auth.users` for any account created
-- directly through Supabase Auth (e.g. a future customer sign-up flow).
-- Admin accounts created via `npm run admin:create` already insert their own
-- profile row explicitly, so this trigger simply no-ops for them (ON CONFLICT).
-- =============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, "fullName", role, "createdAt", "updatedAt")
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', 'CUSTOMER', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
