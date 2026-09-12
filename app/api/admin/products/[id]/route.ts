import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getAuthedAdmin } from "@/lib/auth/guard";
import { adminProductSchema } from "@/lib/validation/schemas";
import { isValidUuid } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUuid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const body = await request.json().catch(() => null);
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { images, occasionIds, recipientIds, ...data } = parsed.data;

  const conflict = await prisma.product.findFirst({ where: { slug: data.slug, id: { not: id } } });
  if (conflict) {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productOccasion.deleteMany({ where: { productId: id } });
    await tx.productRecipient.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        ...data,
        images: { create: images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i })) },
        occasions: { create: occasionIds.map((oid) => ({ occasionId: oid })) },
        recipients: { create: recipientIds.map((rid) => ({ recipientId: rid })) },
      },
    });
  });

  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true, product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUuid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  // Soft delete — preserves history (past enquiry_items still reference this product).
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });

  revalidatePath("/products");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
