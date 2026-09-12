import { prisma } from "@/lib/db/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, isActive: true, deletedAt: null } });
}

export async function getPublishedTestimonials(limit = 6) {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}
