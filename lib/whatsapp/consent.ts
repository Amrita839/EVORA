import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Checks whether we have recorded, explicit WhatsApp opt-in for this phone
 * number. This gate must be checked before any business-initiated follow-up
 * message (see README "WhatsApp Setup" and spec section 16) — we never
 * message someone just because they viewed or enquired about a product.
 */
export async function hasWhatsAppConsent(phoneNumber: string): Promise<boolean> {
  const normalized = phoneNumber.replace(/[^\d]/g, "");
  const consent = await prisma.whatsappConsent.findFirst({
    where: { phoneNumber: normalized, whatsappOptIn: true },
    orderBy: { createdAt: "desc" },
  });
  return Boolean(consent && !consent.optOutAt);
}

export async function recordWhatsAppConsent(input: {
  phoneNumber: string;
  optIn: boolean;
  source: string;
  sessionId?: string;
  userId?: string;
}) {
  const normalized = input.phoneNumber.replace(/[^\d]/g, "");
  await prisma.whatsappConsent.create({
    data: {
      phoneNumber: normalized,
      whatsappOptIn: input.optIn,
      optInAt: input.optIn ? new Date() : null,
      optOutAt: input.optIn ? null : new Date(),
      source: input.source,
      sessionId: input.sessionId,
      userId: input.userId,
    },
  });
}
