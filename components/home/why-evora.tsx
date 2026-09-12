import { Gift, Sparkles, Palette, Package, Headset } from "lucide-react";
import { whyEvora } from "@/lib/site-config";
import { SectionHeading } from "./section-heading";

const ICONS = [Gift, Sparkles, Palette, Package, Headset];

export function WhyEvora() {
  return (
    <section className="bg-beige-100/60 py-20">
      <div className="container-evora">
        <SectionHeading eyebrow="Why Evora" title="Gifting, done with intention" align="center" className="mx-auto" />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {whyEvora.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={item.title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-forest-900 text-champagne-400">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-serif text-lg text-forest-950">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
