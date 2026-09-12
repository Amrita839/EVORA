import { prisma } from "@/lib/db/prisma";
import { subDays, format, startOfDay } from "date-fns";

export async function getDashboardOverview() {
  const [totalProducts, activeProducts, newEnquiries, whatsappLeads, totalLeads] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { whatsappOptIn: true } }),
    prisma.lead.count(),
  ]);

  return { totalProducts, activeProducts, newEnquiries, whatsappLeads, totalLeads };
}

export async function getPopularProducts(limit = 5) {
  const grouped = await prisma.productView.groupBy({
    by: ["productId"],
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const countMap = new Map(grouped.map((g) => [g.productId, g._count.productId]));
  return products
    .map((p) => ({ product: p, views: countMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.views - a.views);
}

export async function getTopCategories(limit = 5) {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
    take: limit,
  });
  return categories;
}

export async function getEventTypeCounts(days = 30) {
  const since = subDays(new Date(), days);
  const grouped = await prisma.event.groupBy({
    by: ["type"],
    where: { createdAt: { gte: since } },
    _count: { type: true },
  });
  return grouped.map((g) => ({ type: g.type, count: g._count.type })).sort((a, b) => b.count - a.count);
}

export async function getTopSearchQueries(limit = 10) {
  const events = await prisma.event.findMany({
    where: { type: "SEARCH" },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { metadata: true },
  });

  const counts = new Map<string, number>();
  for (const event of events) {
    const query = (event.metadata as { query?: string } | null)?.query;
    if (!query) continue;
    const key = query.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getDailyCounts(days = 14) {
  const since = startOfDay(subDays(new Date(), days - 1));

  const [views, enquiries, events] = await Promise.all([
    prisma.productView.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.enquiry.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.event.findMany({
      where: { createdAt: { gte: since }, type: "AI_MESSAGE" },
      select: { createdAt: true },
    }),
  ]);

  const buckets: Record<string, { date: string; views: number; enquiries: number; aiMessages: number }> = {};
  for (let i = 0; i < days; i++) {
    const key = format(subDays(new Date(), days - 1 - i), "MMM d");
    buckets[key] = { date: key, views: 0, enquiries: 0, aiMessages: 0 };
  }

  const bump = (date: Date, field: "views" | "enquiries" | "aiMessages") => {
    const key = format(date, "MMM d");
    if (buckets[key]) buckets[key][field] += 1;
  };

  views.forEach((v) => bump(v.createdAt, "views"));
  enquiries.forEach((e) => bump(e.createdAt, "enquiries"));
  events.forEach((e) => bump(e.createdAt, "aiMessages"));

  return Object.values(buckets);
}
