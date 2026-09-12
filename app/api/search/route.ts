import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Global product search. Matches name, description, tags, category name,
 * occasion and recipient — intentionally broad so natural queries like
 * "gift for employees" or "diwali gifts" return something useful.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? undefined;
  const occasion = searchParams.get("occasion") ?? undefined;
  const recipient = searchParams.get("recipient") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const featured = searchParams.get("featured");
  const bestSeller = searchParams.get("bestSeller");
  const customizable = searchParams.get("customizable");

  if (q.length === 0 && !category && !occasion && !recipient) {
    return NextResponse.json({ products: [] });
  }

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
      { category: { name: { contains: q, mode: "insensitive" } } },
      { occasions: { some: { occasion: { name: { contains: q, mode: "insensitive" } } } } },
      { recipients: { some: { recipient: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  if (category) where.category = { slug: category };
  if (occasion) where.occasions = { some: { occasion: { slug: occasion } } };
  if (recipient) where.recipients = { some: { recipient: { slug: recipient } } };
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }
  if (featured === "true") where.isFeatured = true;
  if (bestSeller === "true") where.isBestSeller = true;
  if (customizable === "true") where.customizationAvailable = true;

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  return NextResponse.json({ products });
}
