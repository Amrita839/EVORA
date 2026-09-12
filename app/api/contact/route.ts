import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { contactSchema } from "@/lib/validation/schemas";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { createOrUpdateLead, notifyBusinessOfEnquiry } from "@/lib/whatsapp/leads";
import { recordWhatsAppConsent } from "@/lib/whatsapp/consent";

export async function POST(request: Request) {
  const rate = checkRateLimit(`contact:${getClientKey(request)}`, { limit: 8, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, phone, message, whatsappOptIn } = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: {
      type: "GENERAL",
      source: "CONTACT_FORM",
      name,
      email,
      phone: phone || "not provided",
      message,
      whatsappOptIn,
    },
    include: { items: true },
  });

  if (phone) {
    await Promise.all([
      createOrUpdateLead({ phone, name, email, source: "contact_form", whatsappOptIn }),
      whatsappOptIn
        ? recordWhatsAppConsent({ phoneNumber: phone, optIn: true, source: "contact_form" })
        : Promise.resolve(),
    ]);
  }

  await notifyBusinessOfEnquiry(enquiry).catch(() => null);

  return NextResponse.json({ ok: true });
}
