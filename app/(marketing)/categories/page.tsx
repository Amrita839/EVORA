import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveCategories } from "@/lib/db/categories";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse Evora Gifting's collections — corporate, festive, personalized and luxury gifting.",
};

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="container-evora py-14">
      <div className="mb-10 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Collections</span>
        <h1 className="font-serif text-4xl text-forest-950">Shop by Collection</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-beige-100 p-6"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/15 to-transparent" />
            <div className="relative">
              <span className="font-serif text-xl text-ivory-50">{category.name}</span>
              {category.description && (
                <p className="mt-1 line-clamp-2 text-sm text-ivory-100/75">{category.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
