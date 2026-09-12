"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
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
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PackageSearch } from "lucide-react";

type Row = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  price: number | null;
  pricingMode: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  imageUrl: string | null;
};

export function AdminProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deactivated");
      router.refresh();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return <EmptyState icon={PackageSearch} title="No products yet" description="Create your first product to get started." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-beige-100/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-beige-100">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="40px" className="object-cover" />}
                  </div>
                  <div>
                    <Link href={`/products/${p.slug}`} target="_blank" className="font-medium text-forest-900 hover:underline">
                      {p.name}
                    </Link>
                    <div className="flex gap-1 pt-0.5">
                      {p.isFeatured && <Badge variant="outline">Featured</Badge>}
                      {p.isBestSeller && <Badge variant="accent">Best Seller</Badge>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
              <td className="px-4 py-3">{p.pricingMode === "ENQUIRY_ONLY" ? "Enquire" : formatPrice(p.price)}</td>
              <td className="px-4 py-3">
                <Badge variant={p.isActive ? "default" : "muted"}>{p.isActive ? "Active" : "Inactive"}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate {p.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes it from the storefront but keeps its enquiry history. You can reactivate it later from the database if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
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
