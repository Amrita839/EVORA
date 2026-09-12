"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { ProductCard } from "@/components/products/product-card";
import type { ProductCardData } from "@/types";

export function RecentlyViewedRail({ excludeSlug }: { excludeSlug?: string }) {
  const { slugs } = useRecentlyViewed();
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    const filtered = slugs.filter((s) => s !== excludeSlug);
    if (filtered.length === 0) {
      // Clears stale results when the recently-viewed list (from localStorage) empties out.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts([]);
      return;
    }
    fetch(`/api/products?slugs=${filtered.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, [slugs, excludeSlug]);

  if (products.length === 0) return null;

  return (
    <section className="container-evora py-16">
      <h2 className="mb-8 font-serif text-2xl text-forest-950">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
