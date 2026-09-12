import { NextResponse } from "next/server";
import { createOrUpdateLead } from "@/lib/whatsapp/leads";
import { recordWhatsAppConsent } from "@/lib/whatsapp/consent";

/**
 * Meta WhatsApp Business Cloud API webhook.
 *
 * GET handles the one-time subscription verification handshake.
 * POST receives inbound message/status events. We use this only to:
 *   - keep Lead records in sync when someone messages the business number
 *   - honour explicit opt-out keywords (STOP/UNSUBSCRIBE) against our own
 *     consent records
 * We do NOT auto-reply or run any business logic here — this is intake only.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

const OPT_OUT_KEYWORDS = ["stop", "unsubscribe", "opt out", "optout"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  try {
    const entries = body.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const messages = value?.messages ?? [];
        const contacts = value?.contacts ?? [];

        for (const message of messages) {
          const from: string | undefined = message.from;
          if (!from) continue;

          const contactName = contacts.find((c: { wa_id?: string }) => c.wa_id === from)?.profile?.name;
          const text: string | undefined = message.text?.body;

          await createOrUpdateLead({ phone: from, name: contactName, source: "whatsapp" });

          if (text && OPT_OUT_KEYWORDS.some((kw) => text.trim().toLowerCase() === kw)) {
            await recordWhatsAppConsent({ phoneNumber: from, optIn: false, source: "whatsapp_opt_out" });
          }
        }
      }
    }
  } catch (error) {
    console.error("[whatsapp webhook] failed to process payload:", error);
  }

  // Meta requires a 200 response regardless, to avoid retry storms.
  return NextResponse.json({ ok: true });
}
