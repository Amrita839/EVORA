import { useEffect, useState } from "react";
import { resolveWording, templateWording, type WordingResult } from "./wording";
import type { Habit } from "./types";

/** Template wording at once; AI wording replaces it when it arrives and passes every check. */
export function useWording(habits: Habit[], aiActive: boolean) {
  const [ai, setAi] = useState<Record<string, WordingResult>>({});
  const [pending, setPending] = useState(false);
  const key = habits.map((h) => `${h.id}:${h.cost_rupees}`).join("|");

  useEffect(() => {
    let cancelled = false;
    setAi({});
    if (!aiActive || habits.length === 0) {
      setPending(false);
      return;
    }
    setPending(true);
    Promise.all(habits.map((h) => resolveWording(h.facts, { aiOn: true }))).then((rs) => {
      if (cancelled) return;
      setAi(Object.fromEntries(habits.map((h, i) => [h.id, rs[i]])));
      setPending(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, aiActive]);

  const wordingFor = (h: Habit): WordingResult =>
    ai[h.id] ?? { wording: templateWording(h.facts), source: "template", aiAttempted: false };
  return { wordingFor, pending };
}
