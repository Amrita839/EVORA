import { prisma } from "@/lib/db/prisma";
import type { SiteSettings } from "@prisma/client";

const FALLBACK_SETTINGS: SiteSettings = {
  id: "default",
  companyName: "Evora Gifting",
  tagline: "Every gift, intentional",
  phone: null,
  email: null,
  whatsappNumber: null,
  address: null,
  instagramUrl: null,
  linkedinUrl: null,
  facebookUrl: null,
  logoUrl: null,
  faviconUrl: null,
  footerText: "Thoughtfully curated gifts for people, teams and moments that matter.",
  businessHours: null,
  whatsappEnabled: false,
  corporateInfo: null,
  customGiftingInfo: null,
  updatedAt: new Date(),
};

/** Reads the singleton site settings row, seeding sensible defaults if missing. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return settings ?? FALLBACK_SETTINGS;
  } catch {
    // DB unreachable (e.g. during local dev before DATABASE_URL is configured) —
    // degrade to static defaults rather than crashing every page.
    return FALLBACK_SETTINGS;
  }
}
