import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { footerLinks } from "@/lib/site-config";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { InstagramIcon, LinkedinIcon, FacebookIcon } from "@/components/shared/social-icons";
import type { SiteSettings } from "@prisma/client";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-border bg-forest-950 text-ivory-100">
      <div className="container-evora grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <span className="font-serif text-2xl text-ivory-50">{settings.companyName}</span>
          <p className="max-w-xs text-sm text-ivory-100/70">
            {settings.footerText ?? "Thoughtfully curated gifts for people, teams and moments that matter."}
          </p>
          <div className="flex gap-3 pt-2">
            {settings.instagramUrl && (
              <SocialIcon href={settings.instagramUrl} label="Instagram">
                <InstagramIcon className="size-4" />
              </SocialIcon>
            )}
            {settings.linkedinUrl && (
              <SocialIcon href={settings.linkedinUrl} label="LinkedIn">
                <LinkedinIcon className="size-4" />
              </SocialIcon>
            )}
            {settings.facebookUrl && (
              <SocialIcon href={settings.facebookUrl} label="Facebook">
                <FacebookIcon className="size-4" />
              </SocialIcon>
            )}
          </div>
        </div>

        <FooterColumn title="Shop" links={footerLinks.shop} />
        <FooterColumn title="Company" links={footerLinks.company} />

        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-base text-ivory-50">Stay in the loop</h3>
          <NewsletterForm variant="dark" />
          <div className="flex flex-col gap-2 pt-2 text-sm text-ivory-100/70">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-ivory-50">
                <Mail className="size-4" /> {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-ivory-50">
                <Phone className="size-4" /> {settings.phone}
              </a>
            )}
            {settings.address && (
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {settings.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-ivory-100/10">
        <div className="container-evora flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory-100/60 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </span>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ivory-50">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-serif text-base text-ivory-50">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-ivory-100/70 transition-colors hover:text-ivory-50">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-ivory-100/20 text-ivory-100 transition-colors hover:border-champagne-500 hover:text-champagne-500"
    >
      {children}
    </a>
  );
}
