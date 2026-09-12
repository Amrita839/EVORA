/**
 * Structural navigation/content config that doesn't belong in the database —
 * page routes, nav labels, static "shop by occasion" tiles. Anything the
 * owner should be able to edit without a deploy lives in `SiteSettings`
 * (see prisma/schema.prisma) instead, fetched via `getSiteSettings()`.
 */

export const mainNav = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Custom Gifting", href: "/custom-gifting" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Collections", href: "/categories" },
    { label: "Corporate Gifting", href: "/corporate-gifting" },
    { label: "Custom Gifting", href: "/custom-gifting" },
  ],
  company: [
    { label: "About Evora", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

export const shopByOccasion = [
  { name: "Birthday", slug: "birthday" },
  { name: "Wedding", slug: "wedding" },
  { name: "Anniversary", slug: "anniversary" },
  { name: "Festive", slug: "festive" },
  { name: "Corporate", slug: "corporate" },
  { name: "Employee Onboarding", slug: "employee-onboarding" },
  { name: "Client Appreciation", slug: "client-appreciation" },
  { name: "Welcome", slug: "welcome" },
  { name: "Thank You", slug: "thank-you" },
] as const;

export const whyEvora = [
  {
    title: "Thoughtfully Curated",
    description: "Every product is selected with a recipient and occasion in mind, not mass-stocked.",
  },
  {
    title: "Premium Quality",
    description: "Materials, packaging and presentation built to reflect well on the giver.",
  },
  {
    title: "Custom Branding",
    description: "Add your logo, colours or a personal message to selected gifts.",
  },
  {
    title: "Bulk Orders",
    description: "Structured support for large quantity and corporate gifting requirements.",
  },
  {
    title: "Personalized Service",
    description: "A real conversation on WhatsApp, not just a checkout button.",
  },
] as const;

export const DEMO_DATA_NOTICE =
  "Sample catalog for demonstration — replace via Admin → Products.";
