import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import type { Role } from "@prisma/client";

export type AuthedUser = {
  id: string;
  email: string;
  role: Role;
  fullName: string | null;
};

/**
 * Server-side authorization check: verifies a real Supabase session AND that
 * the associated profile has an admin-capable role. Middleware only checks
 * "is logged in" — this is where role enforcement actually happens, so every
 * admin page/route handler must call it directly rather than trusting the
 * middleware redirect alone.
 */
export async function requireAdmin(): Promise<AuthedUser> {
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth
    .getUser()
    .then(({ data }) => data.user)
    .catch(() => null);

  if (!user) {
    redirect("/admin/login");
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });

  if (!profile || (profile.role !== "ADMIN" && profile.role !== "STAFF")) {
    redirect("/admin/login?error=unauthorized");
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.fullName,
  };
}

/** Non-redirecting variant for API route handlers — returns null instead of throwing. */
export async function getAuthedAdmin(): Promise<AuthedUser | null> {
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth
    .getUser()
    .then(({ data }) => data.user)
    .catch(() => null);

  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "STAFF")) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.fullName,
  };
}
