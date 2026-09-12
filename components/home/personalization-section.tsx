import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PersonalizationSection() {
  return (
    <section className="container-evora py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:order-2">
          <Image src="/images/categories/personalized-gifts.svg" alt="Personalized gifting" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Custom Gifting</span>
          <h2 className="text-balance font-serif text-3xl text-forest-950 sm:text-4xl">
            Make it unmistakably yours
          </h2>
          <p className="max-w-md text-muted-foreground">
            Monograms, logos and personal notes turn a gift into a gesture. Select products support
            customization — look for the badge on the product page, or tell us what you have in mind.
          </p>
          <div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/custom-gifting">Explore Custom Gifting</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
