"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "evora_recently_viewed";
const MAX_ITEMS = 8;

/**
 * Tracks recently viewed product slugs in localStorage for anonymous
 * visitors. Authenticated-user activity is tracked server-side instead via
 * ProductView rows (see lib/analytics/track.ts) keyed by userId.
 */
export function useRecentlyViewed() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Reads from localStorage, which doesn't exist during SSR — this must
      // stay an effect (client-only) rather than a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSlugs(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const recordView = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  return { slugs, recordView };
}
