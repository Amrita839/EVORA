"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import type { Category } from "@prisma/client";

export function CategoriesTable({ categories }: { categories: (Category & { _count: { products: number } })[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Category deactivated");
      router.refresh();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  }

  if (categories.length === 0) {
    return <EmptyState icon={FolderTree} title="No categories yet" description="Create your first category to organize products." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-beige-100/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Products</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-medium text-forest-900">{c.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{c._count.products}</td>
              <td className="px-4 py-3">
                <Badge variant={c.isActive ? "default" : "muted"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <CategoryFormDialog
                    category={c}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate {c.name}?</AlertDialogTitle>
                        <AlertDialogDescription>Products in this category will remain, but it will be hidden from the storefront.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}>
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
