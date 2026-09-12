-- =============================================================================
-- EVORA GIFTING — Supabase Storage setup for product images
-- =============================================================================
-- 1. Create the bucket first, either in the Supabase dashboard
--    (Storage → New bucket → name: "product-images" → Public bucket: ON),
--    or uncomment and run the insert below.
-- 2. Then run the policies below in the SQL Editor.
-- =============================================================================

-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true)
-- on conflict (id) do nothing;

-- Public read — anyone can view product images (the bucket itself is public,
-- but an explicit policy makes intent clear and works even if the bucket's
-- public flag is later changed).
create policy "product_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only staff/admin (see rls-policies.sql for is_staff_or_admin()) can upload,
-- update or delete files. The app's own upload route (app/api/admin/upload)
-- additionally uses the service-role key server-side, which bypasses this —
-- this policy protects against direct client-side access with a user session.
create policy "product_images_bucket_staff_write"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_staff_or_admin());

create policy "product_images_bucket_staff_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_staff_or_admin());

create policy "product_images_bucket_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_staff_or_admin());
