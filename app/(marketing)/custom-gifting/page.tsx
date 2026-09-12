import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Palette, Type, Package, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Custom Gifting",
  description: "Personalize gifts with monograms, branding, custom packaging and messages.",
};

const CAPABILITIES = [
  { icon: Type, title: "Personalization", description: "Monograms, names and initials on select products." },
  { icon: Palette, title: "Branding", description: "Add your company logo or colours to corporate gifts." },
  { icon: Package, title: "Packaging", description: "Signature or branded packaging for a cohesive unboxing experience." },
  { icon: MessageSquareText, title: "Custom Messages", description: "A personal note included with your gift, on request." },
];

export default async function CustomGiftingPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-evora py-14">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Custom Gifting</span>
          <h1 className="text-balance font-serif text-4xl text-forest-950 sm:text-5xl">Make it unmistakably yours</h1>
          <p className="text-muted-foreground">
            {settings.customGiftingInfo ??
              "Personalize gifts with monograms, logos and custom messaging — exact capabilities vary by product."}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/products?customizable=true">Browse Customizable Gifts</Link>
            </Button>
            {settings.whatsappNumber && (
              <WhatsAppButton
                phoneNumber={settings.whatsappNumber}
                source="custom_gifting_page"
                message="Hi Evora Gifting, I'd like to know more about customization options."
                label="Ask About Customization"
              />
            )}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image src="/images/categories/personalized-gifts.svg" alt="Custom gifting" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((c) => (
          <div key={c.title} className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6">
            <div className="flex size-11 items-center justify-center rounded-full bg-forest-900 text-champagne-400">
              <c.icon className="size-5" />
            </div>
            <h3 className="font-serif text-lg text-forest-950">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
        Exact customization capabilities (turnaround time, minimum quantities, and pricing) are confirmed per
        enquiry — send us your requirements and we&apos;ll let you know what&apos;s possible.
      </p>
    </div>
  );
}
