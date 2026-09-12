import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialFormDialog } from "@/components/admin/testimonial-form-dialog";
import { TestimonialsList } from "@/components/admin/testimonials-list";
import { prisma } from "@/lib/db/prisma";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{testimonials.length} testimonials</p>
        <TestimonialFormDialog
          trigger={
            <Button>
              <Plus /> New Testimonial
            </Button>
          }
        />
      </div>
      <TestimonialsList testimonials={testimonials} />
    </div>
  );
}
