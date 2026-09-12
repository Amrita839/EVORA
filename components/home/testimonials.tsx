import { Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { SectionHeading } from "./section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="container-evora py-20">
      <SectionHeading eyebrow="Testimonials" title="What our clients say" align="center" className="mx-auto" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.id} className="flex flex-col justify-between p-2">
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < t.rating ? "fill-champagne-500 text-champagne-500" : "text-beige-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-charcoal-800">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2">
                <Avatar>
                  <AvatarFallback>{t.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-forest-900">{t.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[t.authorRole, t.company].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
