import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container-evora max-w-3xl py-14">
      <h1 className="mb-2 font-serif text-4xl text-forest-950">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-charcoal-800">
        <Section title="Information We Collect">
          <p>
            We collect information you provide directly — such as your name, phone number, email address, company
            name, and enquiry details — when you submit an enquiry, request a corporate quote, contact us, or
            subscribe to updates. We also collect basic usage data (pages viewed, products viewed, searches) to
            improve the site.
          </p>
        </Section>
        <Section title="WhatsApp Communication">
          <p>
            We only send you messages on WhatsApp if you have explicitly opted in via a checkbox on our site (for
            example, when submitting an enquiry or subscribing to updates). We do not message you on WhatsApp
            without your consent, and you may withdraw consent at any time by contacting us.
          </p>
        </Section>
        <Section title="How We Use Information">
          <p>
            Information you provide is used to respond to your enquiries, prepare quotes, fulfil orders, and — where
            you&apos;ve opted in — share relevant updates. We do not sell your personal information to third
            parties.
          </p>
        </Section>
        <Section title="Cookies & Analytics">
          <p>
            We use basic, privacy-conscious analytics (page views, product views, search queries) to understand how
            the site is used and improve it. This data is not used to build advertising profiles.
          </p>
        </Section>
        <Section title="Data Storage & Security">
          <p>
            Your data is stored securely using industry-standard providers (Supabase/PostgreSQL) with access
            restricted to authorized team members.
          </p>
        </Section>
        <Section title="Contact Us">
          <p>For questions about this policy or to request deletion of your data, please contact us via the Contact page.</p>
        </Section>
      </div>

      <p className="mt-12 rounded-xl bg-beige-100 p-4 text-xs text-muted-foreground">
        This is template policy content provided as a starting point. Please have it reviewed by legal counsel
        before publishing, and update it to reflect your actual data practices, region-specific requirements (e.g.
        India&apos;s DPDP Act), and any payment or logistics partners you use.
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
