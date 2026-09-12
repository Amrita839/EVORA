import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="container-evora max-w-3xl py-14">
      <h1 className="mb-2 font-serif text-4xl text-forest-950">Terms of Service</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-charcoal-800">
        <Section title="About This Site">
          <p>
            This website is an enquiry and gifting-discovery platform. Browsing our catalog and submitting an
            enquiry does not constitute a binding purchase — pricing, availability and customization are confirmed
            directly with our team following your enquiry.
          </p>
        </Section>
        <Section title="Pricing & Availability">
          <p>
            Prices shown are indicative and may vary based on quantity, customization, and current availability.
            Products marked &ldquo;Enquire for pricing&rdquo; require a quote before any order is confirmed.
          </p>
        </Section>
        <Section title="Enquiries & Orders">
          <p>
            Submitting an enquiry (via the website or WhatsApp) is a request for information and does not guarantee
            fulfilment. Orders are confirmed only after mutual agreement on pricing, quantity and delivery terms.
          </p>
        </Section>
        <Section title="Intellectual Property">
          <p>All content on this site, including product photography, text and branding, is the property of Evora Gifting unless otherwise noted.</p>
        </Section>
        <Section title="Limitation of Liability">
          <p>
            We make reasonable efforts to ensure product information is accurate, but we do not guarantee that
            descriptions, images or pricing are error-free at all times.
          </p>
        </Section>
        <Section title="Contact">
          <p>Questions about these terms can be directed to us via the Contact page.</p>
        </Section>
      </div>

      <p className="mt-12 rounded-xl bg-beige-100 p-4 text-xs text-muted-foreground">
        This is template terms-of-service content provided as a starting point. Please have it reviewed by legal
        counsel before publishing, and adapt it to your actual business practices, shipping/returns policy (if any),
        and jurisdiction.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-serif text-xl text-forest-950">{title}</h2>
      {children}
    </div>
  );
}
