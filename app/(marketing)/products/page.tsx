import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSort } from "@/components/products/product-sort";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { getProductList } from "@/lib/db/products";
import { getActiveCategories } from "@/lib/db/categories";
import { toProductCardData } from "@/types";

export const metadata: Metadata = {
  title: "Shop All Gifts",
  description: "Browse Evora Gifting's full catalog of corporate, festive and personalized gifts.",
};

export const revalidate = 60;

type SearchParams = Record<string, string | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, result] = await Promise.all([
    getActiveCategories(),
    getProductList(
      {
        category: params.category,
        occasion: params.occasion,
        recipient: params.recipient,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        featured: params.featured === "true",
        bestSeller: params.bestSeller === "true",
        customizable: params.customizable === "true",
        sort: (params.sort as "newest" | "price-asc" | "price-desc") ?? "newest",
      },
      page
    ),
  ]);

  return (
    <div className="container-evora py-12">
      <div className="mb-10 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Shop</span>
        <h1 className="font-serif text-4xl text-forest-950">All Gifts</h1>
        <p className="text-muted-foreground">{result.total} gifts available</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductFilters categories={categories} />

        <div className="flex-1">
          <div className="mb-6 flex justify-end">
            <ProductSort />
          </div>

          {result.products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try adjusting your filters, or ask our AI assistant for a recommendation."
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={toProductCardData(product)} />
              ))}
            </div>
          )}

          <Pagination page={result.page} totalPages={result.totalPages} basePath="/products" searchParams={params} />
        </div>
      </div>
    </div>
  );
}
