import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/db/prisma";
import { toProductCardData } from "@/types";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const where: Prisma.ProductWhereInput = { isActive: true, deletedAt: null };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
      { tags: { has: query.toLowerCase() } },
      { category: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const products = query
    ? await prisma.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: { select: { name: true, slug: true } } },
        orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }],
        take: 40,
      })
    : [];

  return (
    <div className="container-evora py-14">
      <div className="mb-10 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Search</span>
        <h1 className="font-serif text-4xl text-forest-950">
          {query ? `Results for "${query}"` : "Search Evora Gifting"}
        </h1>
        <p className="text-muted-foreground">{query && `${products.length} gifts found`}</p>
      </div>

      {query && products.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No products found"
          description="Try a different term, browse our collections, or ask our AI assistant for a recommendation."
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={toProductCardData(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
