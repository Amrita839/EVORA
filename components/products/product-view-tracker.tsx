"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function ProductViewTracker({ productId, slug }: { productId: string; slug: string }) {
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    trackEvent("PRODUCT_VIEW", { productId });
    recordView(slug);
    // Only fire once per mount — re-running on every recordView identity change would double-count views.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, slug]);

  return null;
}
