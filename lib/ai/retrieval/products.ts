import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type ExtractedIntent = {
  maxPrice?: number;
  minPrice?: number;
  quantity?: number;
  occasionKeywords: string[];
  recipientKeywords: string[];
  freeTextKeywords: string[];
  wantsCorporate: boolean;
  wantsCustom: boolean;
};

const OCCASION_WORDS = [
  "birthday",
  "wedding",
  "anniversary",
  "festive",
  "diwali",
  "corporate",
  "onboarding",
  "welcome",
  "thank you",
  "client",
  "appreciation",
];

const RECIPIENT_WORDS = [
  "employee",
  "employees",
  "staff",
  "team",
  "client",
  "clients",
  "colleague",
  "colleagues",
  "friend",
  "friends",
  "family",
  "partner",
  "partners",
];

/** Lightweight rule-based intent extraction — no LLM round-trip needed for this. */
export function extractIntent(message: string): ExtractedIntent {
  const lower = message.toLowerCase();

  const priceMatch = lower.match(/(?:under|below|less than|within)\s*(?:rs\.?|₹|inr)?\s*([\d,]+)/i);
  const quantityMatch = lower.match(/(\d+)\s*(?:employees|people|units|pieces|gifts|staff)/i);

  const occasionKeywords = OCCASION_WORDS.filter((w) => lower.includes(w));
  const recipientKeywords = RECIPIENT_WORDS.filter((w) => lower.includes(w));

  return {
    maxPrice: priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : undefined,
    quantity: quantityMatch ? Number(quantityMatch[1]) : undefined,
    occasionKeywords,
    recipientKeywords,
    freeTextKeywords: lower
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
    wantsCorporate: /corporate|bulk|team|office|company/.test(lower),
    wantsCustom: /custom|personali[sz]e|branding|logo|monogram/.test(lower),
  };
}

/**
 * Retrieves real, active products matching the extracted intent. This is the
 * ONLY source of product data the AI assistant is allowed to reference — the
 * model is never permitted to invent a product, price, or ID.
 */
export async function retrieveRelevantProducts(intent: ExtractedIntent, limit = 6) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  if (intent.maxPrice) {
    where.price = { lte: intent.maxPrice };
  }
  if (intent.wantsCorporate) {
    where.corporateAvailable = true;
  }
  if (intent.wantsCustom) {
    where.customizationAvailable = true;
  }

  const keywordOr: Prisma.ProductWhereInput[] = [];
  for (const kw of [...intent.occasionKeywords, ...intent.recipientKeywords]) {
    keywordOr.push(
      { tags: { has: kw } },
      { name: { contains: kw, mode: "insensitive" } },
      { description: { contains: kw, mode: "insensitive" } }
    );
  }

  if (keywordOr.length > 0) {
    where.OR = keywordOr;
  }

  let products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  // Broaden if the keyword-narrowed query came back empty — better to show
  // *something* real than nothing at all.
  if (products.length === 0) {
    const { OR, ...fallbackWhere } = where;
    void OR;
    products = await prisma.product.findMany({
      where: fallbackWhere,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
      orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }],
      take: limit,
    });
  }

  return products;
}

export async function getKnownProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: { id: { in: ids }, isActive: true, deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
  });
}
