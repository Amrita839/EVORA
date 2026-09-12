import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendTemplateMessage } from "./client";
import { hasWhatsAppConsent } from "./consent";
import { getSiteSettings } from "@/lib/settings";
import type { Enquiry, EnquiryItem } from "@prisma/client";

/**
 * Upserts a Lead record keyed by phone number, tracking what they've viewed
 * and enquired about. Called from the enquiry API and (optionally) from
 * product-view tracking once a phone number is known.
 */
export async function createOrUpdateLead(input: {
  phone: string;
  name?: string;
  email?: string;
  company?: string;
  source?: string;
  whatsappOptIn?: boolean;
  productViewed?: string;
  productEnquired?: string;
}) {
  const existing = await prisma.lead.findUnique({ where: { phone: input.phone } });

  const productsViewed = new Set(existing?.productsViewed ?? []);
  if (input.productViewed) productsViewed.add(input.productViewed);

  const productsEnquired = new Set(existing?.productsEnquired ?? []);
  if (input.productEnquired) productsEnquired.add(input.productEnquired);

  return prisma.lead.upsert({
    where: { phone: input.phone },
    update: {
      name: input.name ?? existing?.name,
      email: input.email ?? existing?.email,
      company: input.company ?? existing?.company,
      whatsappOptIn: input.whatsappOptIn ?? existing?.whatsappOptIn ?? false,
      productsViewed: Array.from(productsViewed),
      productsEnquired: Array.from(productsEnquired),
      lastActivityAt: new Date(),
    },
    create: {
      phone: input.phone,
      name: input.name,
      email: input.email,
      company: input.company,
      source: input.source ?? "website",
      whatsappOptIn: input.whatsappOptIn ?? false,
      whatsappOptInAt: input.whatsappOptIn ? new Date() : null,
      productsViewed: Array.from(productsViewed),
      productsEnquired: Array.from(productsEnquired),
    },
  });
}

/**
 * Notifies the business's own WhatsApp number that a new enquiry came in.
 * This targets the OWNER's inbox, not a customer, so customer consent rules
 * don't apply — but it still requires a pre-approved template and Cloud API
 * credentials, and no-ops safely without them (the enquiry is already saved
 * to the database regardless — see /api/enquiries).
 */
export async function notifyBusinessOfEnquiry(enquiry: Enquiry & { items: EnquiryItem[] }) {
  const settings = await getSiteSettings();
  if (!settings.whatsappNumber || !settings.whatsappEnabled) {
    return { ok: false as const, reason: "whatsapp_not_configured" };
  }

  const itemSummary = enquiry.items.length ? `${enquiry.items.length} item(s)` : "a general enquiry";

  return sendTemplateMessage({
    to: settings.whatsappNumber,
    templateName: "new_enquiry_notification",
    bodyParams: [enquiry.name, enquiry.phone, itemSummary],
  });
}

/**
 * Sends a consent-gated follow-up to a customer about a product they showed
 * interest in. Never call this without first checking `hasWhatsAppConsent` —
 * this function re-checks internally as a hard backstop.
 */
export async function sendFollowUpMessage(phoneNumber: string, productName: string) {
  const consented = await hasWhatsAppConsent(phoneNumber);
  if (!consented) {
    return { ok: false as const, reason: "no_consent" };
  }

  return sendTemplateMessage({
    to: phoneNumber,
    templateName: "product_follow_up",
    bodyParams: [productName],
  });
}
