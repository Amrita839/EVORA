import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProductsTable } from "@/components/admin/products-table";
import { prisma } from "@/lib/db/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New Product
          </Link>
        </Button>
      </div>

      <AdminProductsTable
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category?.name ?? null,
          price: p.price ? Number(p.price) : null,
          pricingMode: p.pricingMode,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          imageUrl: p.images[0]?.url ?? null,
        }))}
      />
    </div>
  );
}
