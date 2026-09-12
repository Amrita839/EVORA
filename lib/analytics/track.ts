import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { EventType } from "@prisma/client";

export type TrackEventInput = {
  type: EventType;
  sessionId?: string;
  userId?: string;
  path?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Server-side event recorder — the single write path for analytics events.
 * Never throws: analytics must never break a user-facing request.
 */
export async function recordEvent(input: TrackEventInput): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        type: input.type,
        sessionId: input.sessionId,
        userId: input.userId,
        path: input.path,
        metadata: input.metadata as never,
      },
    });
  } catch (error) {
    console.error("[analytics] failed to record event:", error);
  }
}

export async function recordProductView(productId: string, sessionId?: string, userId?: string) {
  try {
    await prisma.productView.create({ data: { productId, sessionId, userId } });
  } catch (error) {
    console.error("[analytics] failed to record product view:", error);
  }
}
