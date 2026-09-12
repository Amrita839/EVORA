import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/db/prisma";

/**
 * Static, factual knowledge the assistant is allowed to state as company
 * information. Kept intentionally short and non-committal where the business
 * hasn't provided specifics (see AI SAFETY: never invent claims).
 */
const FAQS = [
  {
    q: "How does the enquiry process work?",
    a: "Add products to your enquiry basket, then submit it via WhatsApp or the enquiry form. The Evora team follows up directly with pricing and availability for your quantity.",
  },
  {
    q: "Can I get gifts customized?",
    a: "Many products support customization such as branding or personalization — look for the 'Customization Available' note on a product, or ask in your enquiry.",
  },
  {
    q: "Do you support bulk/corporate orders?",
    a: "Yes — corporate and bulk gifting is a core part of what Evora offers. Use the Corporate Gifting page to request a quote with your quantity and budget.",
  },
  {
    q: "How do I contact Evora directly?",
    a: "Use the WhatsApp button available on product pages, the cart, or the Contact page for a direct conversation with the team.",
  },
];

export async function getCompanyKnowledgeContext(): Promise<string> {
  const settings = await getSiteSettings();

  const categories = await prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    select: { name: true },
    orderBy: { sortOrder: "asc" },
  });

  const lines = [
    `Company: ${settings.companyName}. Tagline: "${settings.tagline}".`,
    settings.corporateInfo ? `Corporate gifting: ${settings.corporateInfo}` : null,
    settings.customGiftingInfo ? `Custom gifting: ${settings.customGiftingInfo}` : null,
    categories.length ? `Available categories: ${categories.map((c) => c.name).join(", ")}.` : null,
    "Frequently asked questions:",
    ...FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`),
  ].filter(Boolean);

  return lines.join("\n");
}
