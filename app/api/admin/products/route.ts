import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getAuthedAdmin } from "@/lib/auth/guard";
import { adminProductSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { images, occasionIds, recipientIds, ...data } = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      images: { create: images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i })) },
      occasions: { create: occasionIds.map((id) => ({ occasionId: id })) },
      recipients: { create: recipientIds.map((id) => ({ recipientId: id })) },
    },
  });

  revalidatePath("/products");
  revalidatePath("/");

  return NextResponse.json({ ok: true, product });
}
