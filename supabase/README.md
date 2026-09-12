# Supabase setup files

These SQL files are meant to be run manually in the Supabase SQL Editor (or via `supabase db execute` / the CLI), **after** your tables exist. Table creation itself is handled by Prisma migrations (`npx prisma migrate deploy`), not by files in this folder — see the root `README.md` → "Supabase Setup" for the full step-by-step.

Run in this order:

1. **`auth-trigger.sql`** — auto-creates a `profiles` row whenever a new Supabase Auth user signs up.
2. **`rls-policies.sql`** — enables Row Level Security on every table and defines who can read/write what.
3. **`storage-setup.sql`** — creates the `product-images` storage bucket (or documents doing so via the dashboard) and its access policies.

All three are idempotent (safe to re-run) except the `create policy` statements, which will error if a policy of the same name already exists — drop it first (`drop policy "policy_name" on public.table_name;`) if you need to re-apply after an edit.
