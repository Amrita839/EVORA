import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAiProvider } from "./providers";
import type { ChatMessage } from "./providers/types";
import { buildAssistantMessages } from "./prompt";
import { extractIntent, retrieveRelevantProducts } from "./retrieval/products";
import { getCompanyKnowledgeContext } from "./retrieval/knowledge";
import type { AiAssistantResponse } from "@/types";

const FALLBACK_RESPONSE: AiAssistantResponse = {
  message:
    "I'm having trouble connecting right now. You can browse our collections or contact us on WhatsApp.",
  productIds: [],
  action: "NONE",
};

const modelResponseSchema = z.object({
  message: z.string(),
  productIds: z.array(z.string()).default([]),
  action: z.enum(["SHOW_PRODUCTS", "NAVIGATE", "NONE"]).default("NONE"),
  navigateTo: z.string().nullable().optional(),
});

export type AssistantInput = {
  message: string;
  sessionId: string;
  history?: ChatMessage[];
};

/**
 * Main entry point for the AI gifting assistant. Retrieves real product/company
 * data, asks the configured provider for a structured recommendation, and
 * guarantees the response never references a product outside what was
 * actually retrieved from the database (see `retrieveRelevantProducts`).
 */
export async function getGiftingAssistantResponse(input: AssistantInput): Promise<AiAssistantResponse> {
  const provider = getAiProvider();

  if (!provider) {
    return FALLBACK_RESPONSE;
  }

  try {
    const available = await provider.isAvailable();
    if (!available) {
      return FALLBACK_RESPONSE;
    }

    const intent = extractIntent(input.message);
    const [products, companyContext] = await Promise.all([
      retrieveRelevantProducts(intent, 6),
      getCompanyKnowledgeContext(),
    ]);

    const productContext = JSON.stringify(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price ? Number(p.price) : null,
        pricingMode: p.pricingMode,
        shortDescription: p.shortDescription,
        minimumOrderQuantity: p.minimumOrderQuantity,
        customizationAvailable: p.customizationAvailable,
        category: p.category?.name ?? null,
        slug: p.slug,
      }))
    );

    const knownIds = new Set(products.map((p) => p.id));

    const messages = buildAssistantMessages({
      userMessage: input.message,
      history: input.history ?? [],
      companyContext,
      productContext,
    });

    const raw = await provider.generate(messages);
    const parsed = parseModelResponse(raw);

    // Never trust model-supplied ids — only pass through ones we actually retrieved.
    const safeProductIds = parsed.productIds.filter((id) => knownIds.has(id));

    await persistConversation(input, parsed.message, safeProductIds).catch(() => {
      /* analytics-only — never fail the user response over a logging error */
    });

    return {
      message: parsed.message,
      productIds: safeProductIds,
      action: safeProductIds.length > 0 ? "SHOW_PRODUCTS" : parsed.action,
      navigateTo: parsed.navigateTo ?? undefined,
    };
  } catch (error) {
    console.error("[ai] assistant generation failed:", error);
    return FALLBACK_RESPONSE;
  }
}

function parseModelResponse(raw: string): z.infer<typeof modelResponseSchema> {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { message: raw.trim() || FALLBACK_RESPONSE.message, productIds: [], action: "NONE" };
  }

  try {
    const candidate = JSON.parse(jsonMatch[0]);
    return modelResponseSchema.parse(candidate);
  } catch {
    return { message: raw.trim() || FALLBACK_RESPONSE.message, productIds: [], action: "NONE" };
  }
}

async function persistConversation(input: AssistantInput, assistantMessage: string, productIds: string[]) {
  const existing = await prisma.aiConversation.findFirst({ where: { sessionId: input.sessionId } });
  const conversation =
    existing ?? (await prisma.aiConversation.create({ data: { sessionId: input.sessionId } }));

  await prisma.aiMessage.createMany({
    data: [
      { conversationId: conversation.id, role: "USER", content: input.message },
      { conversationId: conversation.id, role: "ASSISTANT", content: assistantMessage, productIds },
    ],
  });
}
