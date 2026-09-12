import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { enquirySchema } from "@/lib/validation/schemas";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics/track";
import { createOrUpdateLead, notifyBusinessOfEnquiry } from "@/lib/whatsapp/leads";
import { recordWhatsAppConsent } from "@/lib/whatsapp/consent";

export async function POST(request: Request) {
  const rate = checkRateLimit(`enquiry:${getClientKey(request)}`, { limit: 10, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, email, ...rest } = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: {
      ...rest,
      email: email || undefined,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.name,
        })),
      },
    },
    include: { items: true },
  });

  await Promise.all([
    createOrUpdateLead({
      phone: rest.phone,
      name: rest.name,
      email: email || undefined,
      company: rest.company,
      source: rest.source,
      whatsappOptIn: rest.whatsappOptIn,
      productEnquired: items[0]?.productId,
    }),
    rest.whatsappOptIn
      ? recordWhatsAppConsent({ phoneNumber: rest.phone, optIn: true, source: "enquiry_form", sessionId: rest.sessionId })
      : Promise.resolve(),
    recordEvent({ type: "ENQUIRY_SUBMITTED", sessionId: rest.sessionId, metadata: { enquiryId: enquiry.id, type: rest.type } }),
    notifyBusinessOfEnquiry(enquiry).catch(() => null),
  ]);

  return NextResponse.json({ ok: true, enquiryId: enquiry.id });
}
