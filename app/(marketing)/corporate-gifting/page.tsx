import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { CorporateQuoteForm } from "@/components/corporate/corporate-quote-form";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Corporate Gifting",
  description: "Bulk and corporate gifting for employees, clients and partners — with custom branding and quotes tailored to your budget.",
};

const POINTS = [
  "Dedicated support for bulk quantities",
  "Custom branding, packaging and messaging on select products",
  "Quotes tailored to your budget and timeline, not a fixed price list",
  "Simple enquiry process — no account or checkout required",
];

export default async function CorporateGiftingPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-evora py-14">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">
            Corporate Gifting
          </span>
          <h1 className="text-balance font-serif text-4xl text-forest-950 sm:text-5xl">
            Gifting at scale, without losing the personal touch
          </h1>
          <p className="text-muted-foreground">
            {settings.corporateInfo ??
              "We support bulk and corporate gifting with curated selections and dedicated support for orders of any size."}
          </p>
          <ul className="flex flex-col gap-2.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-charcoal-800">
                <Check className="mt-0.5 size-4 shrink-0 text-forest-700" />
                {point}
              </li>
            ))}
          </ul>
          {settings.whatsappNumber && (
            <WhatsAppButton
              phoneNumber={settings.whatsappNumber}
              source="corporate_gifting_page"
              message="Hi Evora Gifting, I'd like to talk about corporate gifting for my team."
              label="Talk to us on WhatsApp"
              className="w-fit"
            />
          )}
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl">
            <Image src="/images/categories/corporate-gifts.svg" alt="Corporate gifting" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div>
          <CorporateQuoteForm />
        </div>
      </div>
    </div>
  );
}
