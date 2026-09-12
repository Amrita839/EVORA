import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getProductList } from "@/lib/db/products";
import { toProductCardData } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name, description: category.description ?? undefined };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await getProductList({ category: slug }, 1, 24);

  return (
    <div className="container-evora py-14">
      <div className="mb-10 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Collection</span>
        <h1 className="font-serif text-4xl text-forest-950">{category.name}</h1>
        {category.description && <p className="max-w-xl text-muted-foreground">{category.description}</p>}
      </div>

      {result.products.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No products in this collection yet" description="Check back soon." />
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {result.products.map((product) => (
            <ProductCard key={product.id} product={toProductCardData(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
