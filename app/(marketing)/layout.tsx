import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AiAssistantWidget } from "@/components/ai/ai-assistant-widget";
import { getSiteSettings } from "@/lib/settings";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName,
    url: siteUrl,
    ...(settings.logoUrl ? { logo: settings.logoUrl } : {}),
    ...(settings.email || settings.phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: settings.email ?? undefined,
            telephone: settings.phone ?? undefined,
          },
        }
      : {}),
    sameAs: [settings.instagramUrl, settings.linkedinUrl, settings.facebookUrl].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <Navbar companyName={settings.companyName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <AiAssistantWidget />
    </>
  );
}
