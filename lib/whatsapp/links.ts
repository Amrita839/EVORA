import type { BuildEnquiryMessageInput } from "./types";

/**
 * Builds a `wa.me` deep link with a pre-filled message — this requires no
 * API credentials and is what powers every "Chat on WhatsApp" / "Enquire on
 * WhatsApp" button on the public site. The customer sends the message
 * themselves, so no business-initiated messaging rules apply.
 */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildEnquiryMessage({ items, customerName, note }: BuildEnquiryMessageInput): string {
  const lines = [
    "Hi Evora Gifting,",
    "I'm interested in:",
    ...items.map((item) => `• ${item.name} — Qty: ${item.quantity}`),
  ];

  if (note) {
    lines.push("", note);
  } else {
    lines.push("", "I would like more details.");
  }

  if (customerName) {
    lines.push("", `— ${customerName}`);
  }

  return lines.join("\n");
}

export function buildCorporateEnquiryMessage(input: {
  company?: string;
  quantity?: number;
  budgetPerGift?: number;
  occasion?: string;
}): string {
  const lines = ["Hi Evora Gifting, I'd like a corporate gifting quote."];
  if (input.company) lines.push(`Company: ${input.company}`);
  if (input.quantity) lines.push(`Quantity: ${input.quantity}`);
  if (input.budgetPerGift) lines.push(`Budget per gift: ₹${input.budgetPerGift}`);
  if (input.occasion) lines.push(`Occasion: ${input.occasion}`);
  return lines.join("\n");
}
