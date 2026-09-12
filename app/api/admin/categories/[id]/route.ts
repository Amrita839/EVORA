import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getAuthedAdmin } from "@/lib/auth/guard";
import { adminCategorySchema } from "@/lib/validation/schemas";
import { isValidUuid } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUuid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const body = await request.json().catch(() => null);
  const parsed = adminCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const conflict = await prisma.category.findFirst({ where: { slug: parsed.data.slug, id: { not: id } } });
  if (conflict) {
    return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
  }

  const category = await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/categories");
  revalidatePath("/");

  return NextResponse.json({ ok: true, category });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUuid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });

  revalidatePath("/categories");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
