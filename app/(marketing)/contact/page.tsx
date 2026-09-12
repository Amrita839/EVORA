import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/shared/contact-form";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-evora py-14">
      <div className="mb-10 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Contact</span>
        <h1 className="font-serif text-4xl text-forest-950">Get in Touch</h1>
        <p className="max-w-lg text-muted-foreground">
          Questions about a gift, an order, or corporate gifting? Reach out and we&apos;ll get back to you.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          {settings.email && (
            <InfoRow icon={Mail} label="Email" value={settings.email} href={`mailto:${settings.email}`} />
          )}
          {settings.phone && <InfoRow icon={Phone} label="Phone" value={settings.phone} href={`tel:${settings.phone}`} />}
          {settings.address && <InfoRow icon={MapPin} label="Address" value={settings.address} />}
          {settings.businessHours && <InfoRow icon={Clock} label="Hours" value={settings.businessHours} />}

          {settings.whatsappNumber && (
            <WhatsAppButton
              phoneNumber={settings.whatsappNumber}
              source="contact_page"
              message="Hi Evora Gifting, I have a question."
              className="mt-2 w-fit"
            />
          )}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-beige-100 text-forest-700">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium text-forest-900">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="transition-opacity hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}
