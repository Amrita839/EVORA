import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "./section-heading";
import type { ProductCardData } from "@/types";

export function ProductRail({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: ProductCardData[];
  viewAllHref: string;
  tone?: "light" | "muted";
}) {
  if (products.length === 0) return null;

  return (
    <section className={tone === "muted" ? "bg-beige-100/60 py-20" : "py-20"}>
      <div className="container-evora">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <Link href={viewAllHref} className="flex items-center gap-1 text-sm font-medium text-forest-800 hover:underline">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
