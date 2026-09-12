import Link from "next/link";
import { shopByOccasion } from "@/lib/site-config";
import { SectionHeading } from "./section-heading";

export function ShopByOccasion() {
  return (
    <section className="container-evora py-20">
      <SectionHeading eyebrow="Browse" title="Shop by occasion" align="center" className="mx-auto" />
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {shopByOccasion.map((occasion) => (
          <Link
            key={occasion.slug}
            href={`/products?occasion=${occasion.slug}`}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-charcoal-800 transition-all hover:border-forest-700 hover:bg-forest-800 hover:text-ivory-50"
          >
            {occasion.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
