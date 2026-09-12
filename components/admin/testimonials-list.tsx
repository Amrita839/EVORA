"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star, Quote } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestimonialFormDialog } from "@/components/admin/testimonial-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import type { Testimonial } from "@prisma/client";

export function TestimonialsList({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Testimonial removed");
      router.refresh();
    } catch {
      toast.error("Failed to delete testimonial");
    }
  }

  if (testimonials.length === 0) {
    return <EmptyState icon={Quote} title="No testimonials yet" description="Add a testimonial to feature it on the homepage." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <Card key={t.id}>
          <CardContent className="flex flex-col gap-3 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-champagne-500 text-champagne-500" />
                ))}
              </div>
              <Badge variant={t.isPublished ? "default" : "muted"}>{t.isPublished ? "Published" : "Hidden"}</Badge>
            </div>
            <p className="line-clamp-3 text-sm text-charcoal-800">&ldquo;{t.content}&rdquo;</p>
            <div>
              <p className="text-sm font-medium text-forest-900">{t.authorName}</p>
              <p className="text-xs text-muted-foreground">{[t.authorRole, t.company].filter(Boolean).join(", ")}</p>
            </div>
            <div className="flex justify-end gap-1 pt-2">
              <TestimonialFormDialog
                testimonial={t}
                trigger={
                  <Button variant="ghost" size="icon" aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                }
              />
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(t.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
