import Image from "next/image";
import Link from "next/link";
import type { Category } from "@prisma/client";
import { SectionHeading } from "./section-heading";

export function FeaturedCollections({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-evora py-20">
      <SectionHeading
        eyebrow="Collections"
        title="Curated for every relationship"
        description="From client appreciation to employee milestones — start with a collection built for the occasion."
      />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-beige-100 p-5"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 20vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent" />
            <span className="relative font-serif text-lg text-ivory-50">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
