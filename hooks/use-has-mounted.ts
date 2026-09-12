"use client";

import { useEffect, useState } from "react";

/**
 * Guards against hydration mismatches for any UI derived from
 * localStorage-persisted state (the enquiry basket, recently viewed).
 * The server always renders as if that state were empty; this flips to
 * `true` only after the client has mounted and zustand's `persist`
 * middleware has rehydrated from localStorage.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // Intentional: this is the standard hydration-guard pattern — flip once,
  // client-only, after the server-matching first paint.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}
