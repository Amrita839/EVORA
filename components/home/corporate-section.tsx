import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  "Bulk quantities with dedicated support",
  "Custom branding and packaging options",
  "A quote tailored to your budget, not a fixed price list",
];

export function CorporateSection() {
  return (
    <section className="container-evora py-20">
      <div className="grid items-center gap-10 rounded-3xl bg-forest-900 p-8 lg:grid-cols-2 lg:p-14">
        <div className="flex flex-col gap-5 text-ivory-50">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-400">
            Corporate Gifting
          </span>
          <h2 className="text-balance font-serif text-3xl sm:text-4xl">
            Gifting at scale, without losing the personal touch
          </h2>
          <p className="max-w-md text-ivory-100/75">
            Whether it&apos;s onboarding kits for 20 new hires or festive hampers for 500 clients, we structure
            corporate gifting around your quantity, budget and timeline.
          </p>
          <ul className="flex flex-col gap-2.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-ivory-100/85">
                <Check className="mt-0.5 size-4 shrink-0 text-champagne-400" />
                {point}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Button variant="accent" size="lg" asChild>
              <Link href="/corporate-gifting">Plan Corporate Gifting</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image src="/images/categories/corporate-gifts.svg" alt="Corporate gifting" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
