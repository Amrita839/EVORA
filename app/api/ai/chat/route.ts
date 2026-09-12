import { NextResponse } from "next/server";
import { getGiftingAssistantResponse } from "@/lib/ai/aiService";
import { getKnownProductsByIds } from "@/lib/ai/retrieval/products";
import { aiChatSchema } from "@/lib/validation/schemas";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics/track";

export async function POST(request: Request) {
  const rate = checkRateLimit(`ai-chat:${getClientKey(request)}`, { limit: 20, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "You're sending messages a little too fast — please wait a moment.", productIds: [], action: "NONE" },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = aiChatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { message, sessionId, history } = parsed.data;

  const response = await getGiftingAssistantResponse({
    message,
    sessionId,
    history: history.map((h) => ({ role: h.role, content: h.content })),
  });

  const products = await getKnownProductsByIds(response.productIds);

  await recordEvent({ type: "AI_MESSAGE", sessionId, metadata: { message } });

  return NextResponse.json({
    ...response,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      price: p.price ? Number(p.price) : null,
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      pricingMode: p.pricingMode,
      stockStatus: p.stockStatus,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNew: p.isNew,
      customizationAvailable: p.customizationAvailable,
      images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    })),
  });
}
