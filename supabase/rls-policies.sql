-- =============================================================================
-- EVORA GIFTING — Row Level Security policies
-- =============================================================================
-- Run this once against your Supabase project's SQL Editor AFTER the Prisma
-- migrations have created the tables (`npx prisma migrate deploy`).
--
-- Context: the Next.js app talks to Postgres through Prisma using the
-- database's full connection string (DATABASE_URL), which — like the
-- Supabase dashboard and the service-role key — runs as a role that BYPASSES
-- RLS. Authorization for the app itself is enforced in application code
-- (see lib/auth/guard.ts). RLS here is a defense-in-depth layer: it protects
-- these tables against any future direct access from the browser using the
-- Supabase client + anon/authenticated key, which is not how this app is
-- built today but is exactly the kind of mistake RLS exists to catch.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: is the current Supabase auth user an ADMIN or STAFF profile?
-- SECURITY DEFINER so it can read `profiles` without recursing into this
-- same table's own RLS policies.
-- -----------------------------------------------------------------------------
create or replace function public.is_staff_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('ADMIN', 'STAFF')
  );
$$;

-- -----------------------------------------------------------------------------
-- profiles — a user can read/update their own row; staff/admin can read all.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_staff" on public.profiles
  for select using (id = auth.uid() or public.is_staff_or_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- -----------------------------------------------------------------------------
-- Public catalog data — readable by everyone (including anonymous visitors),
-- writable only by staff/admin.
-- -----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.occasions enable row level security;
alter table public.recipients enable row level security;
alter table public.product_occasions enable row level security;
alter table public.product_recipients enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

create policy "categories_public_read" on public.categories
  for select using ("isActive" = true and "deletedAt" is null);
create policy "categories_staff_write" on public.categories
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "products_public_read" on public.products
  for select using ("isActive" = true and "deletedAt" is null);
create policy "products_staff_write" on public.products
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "product_images_public_read" on public.product_images
  for select using (true);
create policy "product_images_staff_write" on public.product_images
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "occasions_public_read" on public.occasions for select using (true);
create policy "occasions_staff_write" on public.occasions
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "recipients_public_read" on public.recipients for select using (true);
create policy "recipients_staff_write" on public.recipients
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "product_occasions_public_read" on public.product_occasions for select using (true);
create policy "product_occasions_staff_write" on public.product_occasions
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "product_recipients_public_read" on public.product_recipients for select using (true);
create policy "product_recipients_staff_write" on public.product_recipients
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "testimonials_public_read" on public.testimonials
  for select using ("isPublished" = true);
create policy "testimonials_staff_write" on public.testimonials
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_staff_write" on public.site_settings
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- -----------------------------------------------------------------------------
-- Private / operational data — no public access at all. Only staff/admin
-- (and the server, which bypasses RLS) can read or write these.
-- -----------------------------------------------------------------------------
alter table public.enquiries enable row level security;
alter table public.enquiry_items enable row level security;
alter table public.leads enable row level security;
alter table public.whatsapp_consents enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.product_views enable row level security;
alter table public.events enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "enquiries_staff_only" on public.enquiries
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "enquiry_items_staff_only" on public.enquiry_items
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "leads_staff_only" on public.leads
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "whatsapp_consents_staff_only" on public.whatsapp_consents
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "newsletter_subscribers_staff_only" on public.newsletter_subscribers
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "product_views_staff_only" on public.product_views
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "events_staff_only" on public.events
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "ai_conversations_staff_only" on public.ai_conversations
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "ai_messages_staff_only" on public.ai_messages
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
