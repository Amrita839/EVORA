import "server-only";
import type { SendTemplateMessageInput, WhatsAppSendResult } from "./types";

const GRAPH_VERSION = "v21.0";

function isConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Sends a pre-approved WhatsApp template message via the official Meta
 * WhatsApp Business Cloud API. Template messages are the only way to
 * business-initiate a conversation outside a customer's 24-hour session
 * window, and Meta requires every template to be pre-approved in Business
 * Manager before this call will succeed.
 *
 * Gracefully no-ops (with a logged reason) when credentials aren't
 * configured, so the rest of the app never has to special-case "WhatsApp
 * isn't set up yet."
 */
export async function sendTemplateMessage(input: SendTemplateMessageInput): Promise<WhatsAppSendResult> {
  if (!isConfigured()) {
    console.warn("[whatsapp] sendTemplateMessage skipped — WHATSAPP_ACCESS_TOKEN not configured.");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: input.to.replace(/[^\d]/g, ""),
          type: "template",
          template: {
            name: input.templateName,
            language: { code: input.languageCode ?? "en" },
            components: input.bodyParams?.length
              ? [
                  {
                    type: "body",
                    parameters: input.bodyParams.map((text) => ({ type: "text", text })),
                  },
                ]
              : undefined,
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, reason: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, messageId: data?.messages?.[0]?.id ?? "unknown" };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "unknown_error" };
  }
}

/**
 * Sends a free-form text message within an existing 24-hour customer session
 * (e.g. replying to an inbound message). Cannot be used to initiate contact.
 */
export async function sendSessionMessage(to: string, text: string): Promise<WhatsAppSendResult> {
  if (!isConfigured()) {
    console.warn("[whatsapp] sendSessionMessage skipped — WHATSAPP_ACCESS_TOKEN not configured.");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/[^\d]/g, ""),
          type: "text",
          text: { body: text },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, reason: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, messageId: data?.messages?.[0]?.id ?? "unknown" };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "unknown_error" };
  }
}
