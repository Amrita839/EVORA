import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { corporateQuoteSchema } from "@/lib/validation/schemas";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics/track";
import { createOrUpdateLead, notifyBusinessOfEnquiry } from "@/lib/whatsapp/leads";
import { recordWhatsAppConsent } from "@/lib/whatsapp/consent";

export async function POST(request: Request) {
  const rate = checkRateLimit(`corporate-quote:${getClientKey(request)}`, { limit: 5, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = corporateQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: {
      type: "CORPORATE",
      source: "CORPORATE_FORM",
      name: data.name,
      phone: data.phone,
      email: data.email,
      company: data.company,
      message: data.message,
      quantity: data.quantity,
      budgetPerGift: data.budgetPerGift,
      occasion: data.occasion,
      deliveryTimeline: data.deliveryTimeline,
      customizationRequired: data.customizationRequired,
      whatsappOptIn: data.whatsappOptIn,
    },
    include: { items: true },
  });

  await Promise.all([
    createOrUpdateLead({
      phone: data.phone,
      name: data.name,
      email: data.email,
      company: data.company,
      source: "corporate_form",
      whatsappOptIn: data.whatsappOptIn,
    }),
    data.whatsappOptIn
      ? recordWhatsAppConsent({ phoneNumber: data.phone, optIn: true, source: "corporate_quote_form" })
      : Promise.resolve(),
    recordEvent({ type: "CORPORATE_QUOTE", metadata: { enquiryId: enquiry.id } }),
    notifyBusinessOfEnquiry(enquiry).catch(() => null),
  ]);

  return NextResponse.json({ ok: true, enquiryId: enquiry.id });
}
