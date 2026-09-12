import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

const cardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductInclude;

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null, isFeatured: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null, isBestSeller: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null, isNew: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      occasions: { include: { occasion: true } },
      recipients: { include: { recipient: true } },
    },
  });
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      id: { not: excludeId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: cardInclude,
    orderBy: { isBestSeller: "desc" },
    take: limit,
  });
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true, deletedAt: null },
    include: cardInclude,
  });
  // Preserve the requested order (e.g. recently viewed, most-recent-first).
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
}

export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true, deletedAt: null },
    include: cardInclude,
  });
  const map = new Map(products.map((p) => [p.slug, p]));
  return slugs.map((s) => map.get(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
}

export type ProductListFilters = {
  category?: string;
  occasion?: string;
  recipient?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestSeller?: boolean;
  customizable?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
};

export async function getProductList(filters: ProductListFilters, page = 1, pageSize = 12) {
  const where: Prisma.ProductWhereInput = { isActive: true, deletedAt: null };

  if (filters.category) where.category = { slug: filters.category };
  if (filters.occasion) where.occasions = { some: { occasion: { slug: filters.occasion } } };
  if (filters.recipient) where.recipients = { some: { recipient: { slug: filters.recipient } } };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.featured) where.isFeatured = true;
  if (filters.bestSeller) where.isBestSeller = true;
  if (filters.customizable) where.customizationAvailable = true;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { price: "asc" }
      : filters.sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: cardInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
