import { REQUIRED_COLUMNS, type HabitId, type RowErrorKind } from "./types";

/**
 * Deterministic sample traders for September 2026 (NIFTY weekly options, expiry on Tuesdays).
 * Every random draw comes from a seeded generator, so the CSV text is identical on every run.
 * The truth (expected habits, total net P&L) is tracked while generating. It never uses the parser.
 */

export type SampleKey = "a" | "b" | "c" | "d" | "e";

export interface SampleSpec {
  key: SampleKey;
  slug: string;
  name: string;
  blurb: string;
  expected: HabitId[];
}

export interface SampleTruth {
  dataset: string;
  trader: string;
  month: string;
  expected_habits: HabitId[];
  /** Sum of (gross P&L − charges) over every complete round trip the generator made. */
  total_net_pnl: number;
  round_trips: number;
  open_positions: number;
  /** Row-level errors the parser must report (line = line in the file, header is line 1). */
  expected_row_errors: { line: number; kind: RowErrorKind }[];
  rejected_orders: number;
}

export interface SampleDataset {
  spec: SampleSpec;
  csv: string;
  truth: SampleTruth;
}

export const SAMPLE_SPECS: SampleSpec[] = [
  { key: "a", slug: "sample-a-expiry-eshaan", name: "Expiry Eshaan", blurb: "Trades a lot on expiry day and likes cheap, far-away options.", expected: ["expiry_day", "far_otm"] },
  { key: "b", slug: "sample-b-revenge-riya", name: "Revenge Riya", blurb: "Trades bigger right after a loss. Rarely sets a stop-loss.", expected: ["revenge", "no_stop_loss"] },
  { key: "c", slug: "sample-c-holding-harsh", name: "Holding Harsh", blurb: "Holds losers 3× longer than winners. Some days have 12–15 trades.", expected: ["holding_losers", "overtrading"] },
  { key: "d", slug: "sample-d-disciplined-dev", name: "Disciplined Dev", blurb: "Small, steady trades with stop-losses. A profitable month.", expected: [] },
  { key: "e", slug: "sample-e-messy-meera", name: "Messy Meera", blurb: "Same habits as Eshaan, but the file has 6 broken rows.", expected: ["expiry_day", "far_otm"] },
];

// ---------- random + market ----------

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rng = () => number;
const uni = (r: Rng, a: number, b: number) => a + r() * (b - a);
const int = (r: Rng, a: number, b: number) => Math.floor(uni(r, a, b + 1));
const chance = (r: Rng, p: number) => r() < p;
const tick = (x: number) => Math.max(0.05, Math.round(x * 20) / 20);
const r2 = (x: number) => Math.round(x * 100) / 100;

const LOT = 65; // NIFTY lot size assumed for this prototype
const OPEN_SEC = 9 * 3600 + 15 * 60;
const LAST_EXIT_SEC = 15 * 3600 + 25 * 60;
const SEP = "2026-09";

interface Day {
  date: string;
  isTue: boolean;
  open: number;
  amp: number;
  phase: number;
}

const DAYS: Day[] = (() => {
  const r = mulberry32(2026);
  const days: Day[] = [];
  let open = 24500;
  for (let d = 1; d <= 30; d++) {
    const wd = new Date(Date.UTC(2026, 8, d)).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    open = open * (1 + (r() - 0.5) * 0.012);
    days.push({ date: `${SEP}-${String(d).padStart(2, "0")}`, isTue: wd === 2, open, amp: uni(r, 0.002, 0.005), phase: uni(r, 0, 6.28) });
  }
  return days;
})();

const underlyingAt = (day: Day, sec: number) =>
  Math.round(day.open * (1 + day.amp * Math.sin(day.phase + (sec - OPEN_SEC) / 4200)) * 20) / 20;

function expiryOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const ahead = (2 - d.getUTCDay() + 7) % 7;
  return new Date(d.getTime() + ahead * 86400000).toISOString().slice(0, 10);
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function stamp(date: string, sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${date} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Brokerage ₹20 + exchange fee + GST + STT (sell side) + stamp duty (buy side) + SEBI fee. */
function orderCharges(side: "BUY" | "SELL", qty: number, price: number): number {
  const value = qty * price;
  const brokerage = 20;
  const exchange = value * 0.0003553;
  const gst = (brokerage + exchange) * 0.18;
  const stt = side === "SELL" ? value * 0.001 : 0;
  const stamp = side === "BUY" ? value * 0.00003 : 0;
  return r2(brokerage + exchange + gst + stt + stamp + value * 0.000001);
}

// ---------- trades → orders ----------

type SlMode = "hit" | "cancelled" | "none";

interface TradeSpec {
  day: Day;
  entrySec: number;
  holdSec: number;
  type: "CE" | "PE";
  strike: number;
  expiry: string;
  lots: number;
  entryPrice: number;
  exitPrice: number;
  sl: SlMode;
  /** No exit order at all: the position is still open at the end of the file. */
  open?: boolean;
}

type Row = string[];
interface RawOrder {
  sec: number;
  date: string;
  seq: number;
  fields: Omit<Record<(typeof REQUIRED_COLUMNS)[number], string>, "order_id" | "timestamp">;
}

class Book {
  private orders: RawOrder[] = [];
  private busy = new Map<string, [number, number][]>();
  total = 0;
  roundTrips = 0;
  openPositions = 0;
  private seq = 0;

  isBusy(key: string, s: number, e: number) {
    return (this.busy.get(key) ?? []).some(([a, b]) => s <= b && e >= a);
  }

  private push(date: string, sec: number, f: RawOrder["fields"]) {
    this.orders.push({ sec, date, seq: this.seq++, fields: f });
  }

  add(rng: Rng, t: TradeSpec) {
    const qty = t.lots * LOT;
    const key = `${t.type}${t.strike}${t.expiry}`;
    const exitSec = t.entrySec + t.holdSec;
    this.busy.set(key, [...(this.busy.get(key) ?? []), [t.entrySec, t.open ? 1e9 : exitSec]]);
    const common = { symbol: "NIFTY", instrument: t.type, strike: String(t.strike), expiry: t.expiry, quantity: String(qty) };
    const entryU = underlyingAt(t.day, t.entrySec);
    const entryCharges = orderCharges("BUY", qty, t.entryPrice);
    this.push(t.day.date, t.entrySec, {
      ...common, side: "BUY", price: t.entryPrice.toFixed(2), order_type: chance(rng, 0.5) ? "MARKET" : "LIMIT",
      status: "COMPLETE", underlying_price: entryU.toFixed(2), charges: entryCharges.toFixed(2),
    });
    if (t.open) {
      this.openPositions++;
      return;
    }
    const exitU = underlyingAt(t.day, exitSec);
    const exitCharges = orderCharges("SELL", qty, t.exitPrice);
    const stopType = chance(rng, 0.5) ? "SL" : "SL-M";
    if (t.sl === "hit") {
      this.push(t.day.date, exitSec, { ...common, side: "SELL", price: t.exitPrice.toFixed(2), order_type: stopType, status: "COMPLETE", underlying_price: exitU.toFixed(2), charges: exitCharges.toFixed(2) });
    } else {
      if (t.sl === "cancelled") {
        this.push(t.day.date, t.entrySec + int(rng, 4, 25), { ...common, side: "SELL", price: tick(t.entryPrice * 0.8).toFixed(2), order_type: stopType, status: "CANCELLED", underlying_price: entryU.toFixed(2), charges: "0.00" });
      }
      this.push(t.day.date, exitSec, { ...common, side: "SELL", price: t.exitPrice.toFixed(2), order_type: chance(rng, 0.5) ? "MARKET" : "LIMIT", status: "COMPLETE", underlying_price: exitU.toFixed(2), charges: exitCharges.toFixed(2) });
    }
    this.total += (t.exitPrice - t.entryPrice) * qty - entryCharges - exitCharges;
    this.roundTrips++;
  }

  /** Orders in time order with ids ORD0001, ORD0002 ... */
  rows(): Row[] {
    return [...this.orders]
      .sort((a, b) => a.date.localeCompare(b.date) || a.sec - b.sec || a.seq - b.seq)
      .map((o, i) => rowOf(`ORD${String(i + 1).padStart(4, "0")}`, stamp(o.date, o.sec), o.fields));
  }
}

const rowOf = (id: string, ts: string, f: RawOrder["fields"]): Row => [
  id, ts, f.symbol, f.instrument, f.strike, f.expiry, f.side, f.quantity, f.price, f.order_type, f.status, f.underlying_price, f.charges,
];

interface Pick {
  far: boolean;
  /** Distance from spot as a fraction, used for near contracts. */
  dist: [number, number];
  band: [number, number];
  win: boolean;
  /** Size of the price move: +ret on a win, −ret on a loss. */
  ret: number;
  holdMin: number;
  lots: number;
  sl: SlMode;
}

function makeTrade(rng: Rng, book: Book, day: Day, entrySec: number, p: Pick): TradeSpec {
  const holdSec = Math.round(p.holdMin * 60);
  const type: "CE" | "PE" = chance(rng, 0.5) ? "CE" : "PE";
  const spot = underlyingAt(day, entrySec);
  const dist = p.far ? uni(rng, 0.023, 0.045) : uni(rng, p.dist[0], p.dist[1]);
  let strike = Math.round((type === "CE" ? spot * (1 + dist) : spot * (1 - dist)) / 50) * 50;
  const expiry = expiryOf(day.date);
  // Never hold the same contract twice at once: move further away from the price.
  for (let i = 0; i < 3 && book.isBusy(`${type}${strike}${expiry}`, entrySec, entrySec + holdSec); i++) {
    strike += type === "CE" ? 50 : -50;
  }
  const dte = daysBetween(day.date, expiry);
  const sd = spot * 0.13 * Math.sqrt((dte + 0.35 * (1 - (entrySec - OPEN_SEC) / 22500) + 0.05) / 365);
  const intrinsic = Math.max(0, type === "CE" ? spot - strike : strike - spot);
  const otm = Math.max(0, type === "CE" ? strike - spot : spot - strike);
  const model = intrinsic + 0.4 * sd * Math.exp(-0.5 * (otm / sd) ** 2);
  const entryPrice = tick(Math.min(p.band[1], Math.max(p.band[0], model)));
  const exitPrice = tick(entryPrice * (p.win ? 1 + p.ret : 1 - p.ret));
  return { day, entrySec, holdSec, type, strike, expiry, lots: p.lots, entryPrice, exitPrice, sl: p.sl };
}

// ---------- personas ----------

const min = (m: number) => Math.round(m * 60);
const WEEKDAYS = DAYS.filter((d) => !d.isTue);

function personaA(rng: Rng, book: Book) {
  for (const day of DAYS) {
    const n = day.isTue ? int(rng, 6, 7) : chance(rng, 0.85) ? int(rng, 1, 2) : 0;
    let t = OPEN_SEC + int(rng, 300, 1200);
    for (let i = 0; i < n; i++) {
      const far = chance(rng, day.isTue ? 0.55 : 0.3);
      const win = far ? chance(rng, 0.12) : chance(rng, day.isTue ? 0.38 : 0.58);
      const holdMin = win ? uni(rng, 6, 18) : uni(rng, 5, 13);
      if (t + min(holdMin) > LAST_EXIT_SEC - 600) break;
      const ret = far ? (win ? uni(rng, 0.6, 2.0) : uni(rng, 0.35, 0.7)) : win ? uni(rng, 0.15, 0.4) : uni(rng, 0.18, 0.35);
      const sl: SlMode = win ? (chance(rng, 0.6) ? "cancelled" : "none") : chance(rng, 0.7) ? "hit" : "cancelled";
      const spec = makeTrade(rng, book, day, t, { far, dist: [0, 0.012], band: far ? [20, 45] : [60, 170], win, ret, holdMin, lots: far ? int(rng, 3, 5) : int(rng, 1, 2), sl });
      book.add(rng, spec);
      // After a loss, wait just over 30 minutes. Eshaan's problem is the day, not the mood.
      t += spec.holdSec + (win ? int(rng, min(8), min(25)) : int(rng, min(31) + 10, min(42)));
    }
  }
}

function personaB(rng: Rng, book: Book) {
  for (const day of WEEKDAYS) {
    const n = int(rng, 3, 5);
    let t = OPEN_SEC + int(rng, 300, 1500);
    let prevLoss: boolean = false;
    let prevRevenge: boolean = false;
    for (let i = 0; i < n; i++) {
      const revenge: boolean = i > 0 && prevLoss && chance(rng, prevRevenge ? 0.35 : 0.85);
      const win = chance(rng, revenge ? 0.28 : 0.5);
      const sl: SlMode = win ? (chance(rng, 0.1) ? "cancelled" : "none") : chance(rng, 0.12) ? "hit" : "none";
      const holdMin = sl === "hit" ? uni(rng, 6, 15) : win ? uni(rng, 14, 40) : uni(rng, 14, 45);
      if (t + min(holdMin) > LAST_EXIT_SEC - 600) break;
      const ret = win ? uni(rng, 0.1, 0.25) : sl === "hit" ? uni(rng, 0.1, 0.18) : revenge ? uni(rng, 0.25, 0.5) : chance(rng, 0.55) ? uni(rng, 0.08, 0.15) : uni(rng, 0.35, 0.7);
      const spec = makeTrade(rng, book, day, t, { far: false, dist: [0, 0.012], band: [90, 160], win, ret, holdMin, lots: revenge ? 3 : 1, sl });
      book.add(rng, spec);
      prevLoss = !win;
      prevRevenge = revenge;
      const gap = win ? int(rng, min(30), min(80)) : chance(rng, 0.85) ? int(rng, min(2), min(14)) : int(rng, min(32), min(60));
      t += spec.holdSec + gap;
    }
  }
  // Last day: one more position, never closed.
  const last = DAYS[DAYS.length - 1];
  book.add(rng, { ...makeTrade(rng, book, last, 14 * 3600 + 40 * 60, { far: false, dist: [0, 0.01], band: [90, 160], win: true, ret: 0.1, holdMin: 10, lots: 1, sl: "none" }), open: true });
}

function personaC(rng: Rng, book: Book) {
  const heavy = new Set<string>();
  while (heavy.size < 4) heavy.add(WEEKDAYS[int(rng, 1, WEEKDAYS.length - 2)].date);
  for (const day of WEEKDAYS) {
    const isHeavy = heavy.has(day.date);
    const n = isHeavy ? int(rng, 12, 14) : chance(rng, 0.55) ? int(rng, 1, 2) : 0;
    let t = OPEN_SEC + int(rng, 300, 900);
    for (let i = 0; i < n; i++) {
      const win = chance(rng, 0.45);
      const holdMin = win ? uni(rng, 10, 20) : uni(rng, 36, 60);
      if (t + min(holdMin) > LAST_EXIT_SEC - 600) break;
      const ret = win ? uni(rng, 0.08, 0.18) : uni(rng, 0.12, 0.25);
      // Harsh sets a stop-loss and then cancels it when the price gets close.
      const sl: SlMode = win ? (chance(rng, 0.5) ? "cancelled" : "none") : "cancelled";
      const spec = makeTrade(rng, book, day, t, { far: false, dist: [0, 0.008], band: [110, 170], win, ret, holdMin, lots: 1, sl });
      book.add(rng, spec);
      t += isHeavy ? int(rng, min(8), min(19)) : int(rng, min(60), min(120));
    }
  }
}

function personaD(rng: Rng, book: Book) {
  for (const day of WEEKDAYS) {
    const n = int(rng, 2, 4);
    let t = OPEN_SEC + int(rng, 300, 1200);
    for (let i = 0; i < n; i++) {
      const win = chance(rng, 0.58);
      const holdMin = win ? uni(rng, 15, 40) : uni(rng, 8, 20);
      if (t + min(holdMin) > LAST_EXIT_SEC - 600) break;
      const ret = win ? uni(rng, 0.14, 0.28) : uni(rng, 0.08, 0.13);
      const sl: SlMode = win ? (chance(rng, 0.8) ? "cancelled" : "none") : "hit";
      const spec = makeTrade(rng, book, day, t, { far: false, dist: [0, 0.008], band: [70, 170], win, ret, holdMin, lots: 1, sl });
      book.add(rng, spec);
      t += spec.holdSec + int(rng, min(35), min(70));
    }
  }
}

// ---------- assembling datasets ----------

const HEADER = REQUIRED_COLUMNS.join(",");
const toCsv = (rows: Row[]) => [HEADER, ...rows.map((r) => r.join(","))].join("\n") + "\n";

function generate(key: Exclude<SampleKey, "e">): { rows: Row[]; book: Book } {
  const seeds = { a: 11, b: 22, c: 33, d: 44 } as const;
  const rng = mulberry32(seeds[key]);
  const book = new Book();
  ({ a: personaA, b: personaB, c: personaC, d: personaD })[key](rng, book);
  return { rows: book.rows(), book };
}

/** Six broken rows, spread through Eshaan's file. Five must be reported as errors; one rejected order is only ignored. */
function messify(rows: Row[]): { rows: Row[]; errors: SampleTruth["expected_row_errors"]; rejected: number } {
  const n = rows.length;
  const market = { symbol: "NIFTY", strike: "24500", expiry: "2026-09-08", quantity: "65" };
  const base = (id: string, ts: string, o: Partial<Record<string, string>>): Row =>
    rowOf(id, ts, { ...market, instrument: "CE", side: "BUY", price: "110.00", order_type: "MARKET", status: "COMPLETE", underlying_price: "24480.00", charges: "38.00", ...o } as RawOrder["fields"]);
  const dupOf = rows[Math.floor(n * 0.2)];
  const inserts: { at: number; row: Row; kind: RowErrorKind | null }[] = [
    { at: Math.floor(n * 0.1), row: base("ORD9001", "2026-09-31 10:15:00", {}), kind: "bad_date" },
    { at: Math.floor(n * 0.3), row: base("ORD9002", "2026-09-10 11:05:00", { price: "" }), kind: "missing_value" },
    { at: Math.floor(n * 0.45), row: base("ORD9003", "2026-09-11 11:40:00", { instrument: "OPT" }), kind: "bad_value" },
    { at: Math.floor(n * 0.6), row: base("ORD9004", "2026-09-16 12:10:00", { instrument: "PE", strike: "21000", expiry: "2026-09-29", side: "SELL", order_type: "SL", price: "40.00", underlying_price: "24520.00" }), kind: "unmatched_exit" },
    { at: Math.floor(n * 0.75), row: [...dupOf], kind: "duplicate_order_id" },
    { at: Math.floor(n * 0.9), row: base("ORD9006", "2026-09-24 13:20:00", { order_type: "LIMIT", status: "REJECTED", charges: "0.00" }), kind: null },
  ];
  const out: Row[] = [];
  const errors: SampleTruth["expected_row_errors"] = [];
  rows.forEach((r, i) => {
    for (const ins of inserts.filter((x) => x.at === i)) {
      out.push(ins.row);
      if (ins.kind) errors.push({ line: out.length + 1, kind: ins.kind });
    }
    out.push(r);
  });
  return { rows: out, errors, rejected: 1 };
}

const cache = new Map<SampleKey, SampleDataset>();

export function buildSample(key: SampleKey): SampleDataset {
  const hit = cache.get(key);
  if (hit) return hit;
  const spec = SAMPLE_SPECS.find((s) => s.key === key)!;
  const { rows, book } = generate(key === "e" ? "a" : key);
  const messy = key === "e" ? messify(rows) : null;
  const truth: SampleTruth = {
    dataset: spec.slug,
    trader: spec.name,
    month: SEP,
    expected_habits: spec.expected,
    total_net_pnl: r2(book.total),
    round_trips: book.roundTrips,
    open_positions: book.openPositions,
    expected_row_errors: messy?.errors ?? [],
    rejected_orders: messy?.rejected ?? 0,
  };
  const ds = { spec, csv: toCsv(messy?.rows ?? rows), truth };
  cache.set(key, ds);
  return ds;
}
