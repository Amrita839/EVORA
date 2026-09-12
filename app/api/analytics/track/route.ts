import { NextResponse } from "next/server";
import { recordEvent, recordProductView } from "@/lib/analytics/track";
import { trackEventSchema } from "@/lib/validation/schemas";

/**
 * Single ingestion point for client-side analytics (see lib/analytics/client.ts).
 * Always returns 204 quickly — analytics must never block or fail the UI.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);

  if (parsed.success) {
    const { type, sessionId, path, metadata } = parsed.data;
    await recordEvent({ type, sessionId, path, metadata });

    if (type === "PRODUCT_VIEW" && typeof metadata?.productId === "string") {
      await recordProductView(metadata.productId, sessionId);
    }
  }

  return new NextResponse(null, { status: 204 });
}
