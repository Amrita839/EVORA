/**
 * One-time setup script: creates a Supabase Auth user and a matching
 * `Profile` row with role ADMIN, so the site owner can log in to /admin.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts owner@example.com "a-strong-password" "Owner Name"
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to be set
 * (see .env.example) — this uses the service role, so never run it from
 * anywhere but a trusted local/CI shell.
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

async function main() {
  const [email, password, fullName] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password> ["Full Name"]');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const prisma = new PrismaClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    console.error("Failed to create Supabase auth user:", error?.message);
    process.exit(1);
  }

  await prisma.profile.upsert({
    where: { id: data.user.id },
    update: { role: "ADMIN", fullName },
    create: { id: data.user.id, email, fullName, role: "ADMIN" },
  });

  console.log(`✅ Admin user created: ${email} (id: ${data.user.id})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
