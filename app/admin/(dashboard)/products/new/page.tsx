import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db/prisma";

export default async function NewProductPage() {
  const [categories, occasions, recipients] = await Promise.all([
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    prisma.occasion.findMany({ orderBy: { name: "asc" } }),
    prisma.recipient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-3xl">
      <ProductForm categories={categories} occasions={occasions} recipients={recipients} />
    </div>
  );
}
