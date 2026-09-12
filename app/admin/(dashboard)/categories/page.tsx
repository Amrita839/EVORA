import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { CategoriesTable } from "@/components/admin/categories-table";
import { prisma } from "@/lib/db/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus /> New Category
            </Button>
          }
        />
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
