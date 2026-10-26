import type { Facts, Wording } from "./types";

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const n = (v: unknown) => Number(v).toLocaleString("en-IN");

// ---------- Fixed template wording (used whenever AI is off, unavailable, or rejected) ----------

export function templateWording(f: Facts): Wording {
  const v = f as Record<string, number | string>;
  switch (f.habit) {
    case "expiry_day":
      return {
        headline: "Expiry-day trades cost you",
        what_we_saw: `You opened ${n(v.affected_trades)} trades on expiry day (the contract's last day). Together they lost ${rupees(+v.cost_rupees)}.`,
        try_this: `Skip expiry day for ${n(v.experiment_weeks)} weeks. Then compare your month.`,
      };
    case "revenge":
      return {
        headline: "Bigger trades right after losses",
        what_we_saw: `${n(v.affected_trades)} times you opened a bigger trade within ${n(v.window_minutes)} minutes of a loss. Those trades lost ${rupees(+v.cost_rupees)} together.`,
        try_this: `After a loss, wait ${n(v.window_minutes)} minutes before your next trade. Try this for ${n(v.experiment_weeks)} weeks.`,
      };
    case "holding_losers":
      return {
        headline: "You hold losers too long",
        what_we_saw: `Your usual losing trade lasted ${n(v.median_loser_hold_minutes)} minutes. Your usual winner lasted ${n(v.median_winner_hold_minutes)}. ${n(v.affected_trades)} long-held losers cost ${rupees(+v.cost_rupees)}.`,
        try_this: `Decide your exit time before you enter. Close the trade when it arrives, for ${n(v.experiment_weeks)} weeks.`,
      };
    case "far_otm":
      return {
        headline: "Far-from-price options kept losing",
        what_we_saw: `${n(v.affected_trades)} of your option trades were more than ${n(v.far_otm_threshold_pct)}% away from the market price. They lost ${rupees(+v.cost_rupees)} together.`,
        try_this: `Skip these far-away options for ${n(v.experiment_weeks)} weeks. Then compare your month.`,
      };
    case "overtrading":
      return {
        headline: "Too many trades in one day",
        what_we_saw: `On ${n(v.heavy_days)} days you made more than ${n(v.day_limit)} trades. Those ${n(v.affected_trades)} trades lost ${rupees(+v.cost_rupees)}, with ${rupees(+v.charges_rupees)} in charges (brokerage and taxes).`,
        try_this: `Set a limit of ${n(v.day_limit)} trades a day. Stop for the day once you reach it.`,
      };
    case "no_stop_loss":
      return {
        headline: "Losses grow without a stop-loss",
        what_we_saw: `${n(v.affected_trades)} losing trades had no stop-loss (an order that exits early). They lost ${rupees(+v.cost_rupees)} more than your usual loss of ${rupees(+v.usual_loss_rupees)}.`,
        try_this: `Place a stop-loss right after every entry for ${n(v.experiment_weeks)} weeks.`,
      };
  }
}

// ---------- Validation ----------

export const FORBIDDEN_TERMS = ["buy", "sell", "target", "will go up", "will go down", "recommend", "strike"];
export const LIMITS = { headline: 8, what_we_saw: 35, try_this: 25 } as const;
const NUMBER_WORDS =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|fifty|hundred|thousand|lakh|crore|dozen|twice|thrice|half)\b/i;

export type CheckName =
  | "ai_unavailable"
  | "json_parse"
  | "schema"
  | "word_limit"
  | "number_not_in_facts"
  | "missing_cost"
  | "number_word"
  | "forbidden_word";

export type Validation =
  | { ok: true; wording: Wording }
  | { ok: false; check: CheckName; detail: string };

/** Returns the first forbidden term found (case-insensitive substring), or null. */
export function adviceFilter(text: string): string | null {
  const lower = text.toLowerCase();
  return FORBIDDEN_TERMS.find((t) => lower.includes(t)) ?? null;
}

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Numbers as written in text. Handles ₹, Indian and western commas, decimals. */
export function extractNumbers(text: string): number[] {
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((m) => Number(m.replace(/,+$/, "").replace(/,/g, "")));
}

function factNumbers(facts: Facts): number[] {
  return Object.values(facts).filter((v): v is number => typeof v === "number");
}

export function validateWording(raw: string, facts: Facts): Validation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, check: "json_parse", detail: "Output is not valid JSON." };
  }
  const o = parsed as Record<string, unknown>;
  const keys = ["headline", "what_we_saw", "try_this"] as const;
  if (!o || typeof o !== "object" || keys.some((k) => typeof o[k] !== "string" || !(o[k] as string).trim())) {
    return { ok: false, check: "schema", detail: "Needs headline, what_we_saw and try_this as text." };
  }
  const w: Wording = {
    headline: (o.headline as string).trim(),
    what_we_saw: (o.what_we_saw as string).trim(),
    try_this: (o.try_this as string).trim(),
  };
  for (const k of keys) {
    if (wordCount(w[k]) > LIMITS[k]) {
      return { ok: false, check: "word_limit", detail: `${k} is over ${LIMITS[k]} words.` };
    }
  }
  const all = `${w.headline} ${w.what_we_saw} ${w.try_this}`;
  const allowed = factNumbers(facts);
  for (const num of extractNumbers(all)) {
    if (!allowed.some((a) => Math.abs(a - num) < 1e-9)) {
      return { ok: false, check: "number_not_in_facts", detail: `${num} is not in the facts.` };
    }
  }
  if (NUMBER_WORDS.test(all)) {
    return { ok: false, check: "number_word", detail: "Numbers must be written as digits from the facts." };
  }
  const cost = Number(facts.cost_rupees);
  if (!extractNumbers(w.what_we_saw).some((x) => Math.abs(x - cost) < 1e-9)) {
    return { ok: false, check: "missing_cost", detail: "what_we_saw must include the rupee cost." };
  }
  const bad = adviceFilter(all);
  if (bad) return { ok: false, check: "forbidden_word", detail: `Contains "${bad}".` };
  return { ok: true, wording: w };
}

// ---------- AI call (edge function) ----------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const aiConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Asks the edge function for wording. Returns the model's raw text, or an error. Never throws. */
export async function fetchAiRaw(
  facts: Facts,
  userNote?: string,
): Promise<{ raw: string } | { error: string }> {
  if (!aiConfigured) return { error: "AI backend is not connected." };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/replay-wording`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ facts, user_note: userNote }),
      signal: ctrl.signal,
    });
    if (!res.ok) return { error: `AI service answered ${res.status}.` };
    const data = (await res.json()) as { raw?: unknown };
    return typeof data.raw === "string" ? { raw: data.raw } : { error: "AI service sent no text." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "AI call failed." };
  } finally {
    clearTimeout(timer);
  }
}

export interface WordingResult {
  wording: Wording;
  source: "ai" | "template";
  /** Which check failed when AI was tried but the template was used. */
  failedCheck?: CheckName;
  detail?: string;
  /** Raw model text, kept for the test bench. */
  raw?: string;
  aiAttempted: boolean;
}

/** AI wording when allowed and valid; otherwise the fixed template. Never throws. */
export async function resolveWording(
  facts: Facts,
  opts: { aiOn: boolean; userNote?: string; fetcher?: typeof fetchAiRaw },
): Promise<WordingResult> {
  const template = templateWording(facts);
  if (!opts.aiOn) return { wording: template, source: "template", aiAttempted: false };
  const res = await (opts.fetcher ?? fetchAiRaw)(facts, opts.userNote);
  if ("error" in res) {
    return { wording: template, source: "template", failedCheck: "ai_unavailable", detail: res.error, aiAttempted: true };
  }
  const v = validateWording(res.raw, facts);
  if (v.ok) return { wording: v.wording, source: "ai", raw: res.raw, aiAttempted: true };
  return { wording: template, source: "template", failedCheck: v.check, detail: v.detail, raw: res.raw, aiAttempted: true };
}
