"use client";

import { getOrCreateSessionId } from "@/lib/utils";

export type ClientEventType =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "PRODUCT_CLICK"
  | "SEARCH"
  | "AI_MESSAGE"
  | "ADD_TO_ENQUIRY"
  | "WHATSAPP_CLICK"
  | "ENQUIRY_SUBMITTED"
  | "CORPORATE_QUOTE"
  | "NEWSLETTER_SIGNUP";

/**
 * Fire-and-forget client-side event tracker. Provider-agnostic: today it
 * posts to our own `/api/analytics/track` route, which is free to fan out to
 * a third-party analytics provider later without any call site changing.
 */
export function trackEvent(type: ClientEventType, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    type,
    sessionId: getOrCreateSessionId(),
    path: window.location.pathname,
    metadata,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics is best-effort — never let it throw into the UI.
  }
}
