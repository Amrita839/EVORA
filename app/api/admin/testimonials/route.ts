import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getAuthedAdmin } from "@/lib/auth/guard";
import { adminTestimonialSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = adminTestimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({ data: parsed.data });
  revalidatePath("/");

  return NextResponse.json({ ok: true, testimonial });
}
