import { describe, expect, it } from "vitest";
import { detectHabits, detectNoStopLoss, median, rankHabits } from "./habits";
import { classifyMoneyness, matchTrades } from "./matchTrades";
import { parseOrdersCsv, splitCsv } from "./parse";
import { analyze } from "./pipeline";
import { ADVERSARIAL_PAYLOADS, runAllEvals } from "./evals";
import { SAMPLE_SPECS, buildSample } from "./samples";
import { adviceFilter, resolveWording, templateWording, validateWording } from "./wording";
import { REQUIRED_COLUMNS, type Facts, type Trade } from "./types";

const HEAD = REQUIRED_COLUMNS.join(",");
let n = 0;
function order(o: Partial<Record<string, string>>): string {
  const f = {
    order_id: `X${++n}`, timestamp: "2026-09-02 10:00:00", symbol: "NIFTY", instrument: "CE", strike: "24500",
    expiry: "2026-09-08", side: "BUY", quantity: "100", price: "100", order_type: "MARKET", status: "COMPLETE",
    underlying_price: "24500", charges: "10", ...o,
  };
  return REQUIRED_COLUMNS.map((c) => f[c]).join(",");
}
const file = (...rows: string[]) => [HEAD, ...rows].join("\n");
const run = (...rows: string[]) => matchTrades(parseOrdersCsv(file(...rows)).orders);

describe("parse", () => {
  it("stops with a clear message when a column is missing", () => {
    const r = parseOrdersCsv("order_id,timestamp\n1,2");
    expect(r.fatal).toMatch(/Missing columns: symbol/);
  });
  it("skips bad rows with row-level messages and keeps the rest", () => {
    const r = parseOrdersCsv(
      file(
        order({ order_id: "a" }),
        order({ order_id: "b", timestamp: "2026-09-31 10:00:00" }),
        order({ order_id: "c", quantity: "abc" }),
        order({ order_id: "d", price: "" }),
        order({ order_id: "e", instrument: "OPT" }),
        order({ order_id: "a" }),
        order({ order_id: "f", status: "REJECTED" }),
        order({ order_id: "g", status: "CANCELLED", price: "" }),
      ),
    );
    expect(r.errors.map((e) => [e.line, e.kind])).toEqual([
      [3, "bad_date"], [4, "bad_number"], [5, "missing_value"], [6, "bad_value"], [7, "duplicate_order_id"],
    ]);
    expect(r.orders).toHaveLength(3);
    expect(r.rejectedIgnored).toBe(1);
    expect(r.cancelledIgnored).toBe(1);
  });
  it("handles quotes and CRLF", () => {
    expect(splitCsv('a,"b,c"\r\n"d""e",f\r\n')).toEqual([
      { fields: ["a", "b,c"], line: 1 },
      { fields: ['d"e', "f"], line: 2 },
    ]);
  });
});

describe("matchTrades", () => {
  it("matches FIFO with partial exits and averages the exit", () => {
    const m = run(
      order({ order_id: "e1", timestamp: "2026-09-02 10:00:00", quantity: "100", price: "100", charges: "10" }),
      order({ order_id: "e2", timestamp: "2026-09-02 10:10:00", quantity: "100", price: "120", charges: "10" }),
      order({ order_id: "x1", timestamp: "2026-09-02 10:20:00", side: "SELL", quantity: "60", price: "110", charges: "6" }),
      order({ order_id: "x2", timestamp: "2026-09-02 10:30:00", side: "SELL", quantity: "100", price: "130", charges: "10" }),
    );
    const [t1, t2] = m.trades;
    // e1 closed by 60@110 then 40@130
    expect(t1.id).toBe("e1");
    expect(t1.qty).toBe(100);
    expect(t1.exitAvgPrice).toBeCloseTo(118);
    expect(t1.grossPnl).toBeCloseTo(1800);
    expect(t1.holdMinutes).toBe(30);
    expect(t1.charges).toBeCloseTo(10 + 6 + 4);
    // e2 closed by the remaining 60@130 only: 40 units are still open
    expect(t2.qty).toBe(60);
    expect(m.openPositions).toBe(1);
    expect(t2.charges).toBeCloseTo(6 + 6);
  });
  it("supports short trades", () => {
    const [t] = run(
      order({ side: "SELL", price: "100", timestamp: "2026-09-02 10:00:00" }),
      order({ side: "BUY", price: "80", timestamp: "2026-09-02 10:05:00" }),
    ).trades;
    expect(t.direction).toBe("short");
    expect(t.grossPnl).toBeCloseTo(2000);
  });
  it("counts pending/cancelled stop-losses placed while open, not rejected or later ones", () => {
    const m = run(
      order({ order_id: "t1", timestamp: "2026-09-02 10:00:00" }),
      order({ order_id: "s1", timestamp: "2026-09-02 10:00:05", side: "SELL", order_type: "SL", status: "CANCELLED" }),
      order({ order_id: "o1", timestamp: "2026-09-02 10:30:00", side: "SELL" }),
      order({ order_id: "t2", timestamp: "2026-09-02 11:00:00" }),
      order({ order_id: "s2", timestamp: "2026-09-02 11:00:05", side: "SELL", order_type: "SL-M", status: "REJECTED" }),
      order({ order_id: "o2", timestamp: "2026-09-02 11:30:00", side: "SELL" }),
      order({ order_id: "t3", timestamp: "2026-09-02 12:00:00" }),
      order({ order_id: "o3", timestamp: "2026-09-02 12:30:00", side: "SELL" }),
      order({ order_id: "s3", timestamp: "2026-09-02 12:45:00", side: "SELL", order_type: "SL", status: "CANCELLED" }),
    );
    expect(m.trades.map((t) => t.hadStopLoss)).toEqual([true, false, false]);
  });
  it("flags an exit with no entry and ignores it", () => {
    const m = run(order({ order_id: "s", side: "SELL", order_type: "SL" }));
    expect(m.errors[0].kind).toBe("unmatched_exit");
    expect(m.trades).toHaveLength(0);
  });
  it("does not count open positions", () => {
    const m = run(order({}), order({ strike: "24600" }));
    expect(m.trades).toHaveLength(0);
    expect(m.openPositions).toBe(2);
  });
  it("classifies far OTM only when out of the money and more than 2% away", () => {
    expect(classifyMoneyness("CE", 25100, 24500).label).toBe("FAR_OTM"); // 2.45% OTM
    expect(classifyMoneyness("CE", 24900, 24500).label).toBe("OTM"); // 1.6%
    expect(classifyMoneyness("CE", 23800, 24500).label).toBe("ITM"); // deep ITM is not far OTM
    expect(classifyMoneyness("PE", 23900, 24500).label).toBe("FAR_OTM");
    expect(classifyMoneyness("PE", 25100, 24500).label).toBe("ITM");
  });
});

function fakeTrade(i: number, o: Partial<Trade>): Trade {
  return {
    id: `t${i}`, contract: "c", symbol: "NIFTY", instrument: "CE", strike: 24500, expiry: "2026-09-08", direction: "long",
    entryTime: Date.UTC(2026, 8, 2, 10, i), exitTime: Date.UTC(2026, 8, 2, 10, i + 10), entryDate: "2026-09-02",
    entryClock: "10:00", exitClock: "10:10", holdMinutes: 10, qty: 65, entryAvgPrice: 100, exitAvgPrice: 100,
    grossPnl: 0, charges: 0, netPnl: 0, hadStopLoss: true, moneyness: "ATM", distance: 0, underlyingAtEntry: 24500,
    positionValue: 6500, ...o,
  };
}

describe("habits", () => {
  it("applies the shared thresholds", () => {
    const loss = (i: number, pnl: number) => fakeTrade(i, { entryDate: "2026-09-08", netPnl: pnl });
    const exp = (ts: Trade[]) => detectHabits(ts).find((h) => h.id === "expiry_day")!;
    expect(exp([loss(1, -300), loss(2, -300)]).triggered).toBe(false); // only 2 trades
    expect(exp([loss(1, -100), loss(2, -100), loss(3, -100)]).triggered).toBe(false); // cost under ₹500
    expect(exp([loss(1, -200), loss(2, -200), loss(3, 100)]).triggered).toBe(false); // net not enough
    const h = exp([loss(1, -200), loss(2, -200), loss(3, -200), loss(4, 0)]);
    expect(h.triggered).toBe(true);
    expect(h.cost_rupees).toBe(600);
    expect(h.confidence).toBe("Low");
    expect(exp([1, 2, 3, 4, 5].map((i) => loss(i, -200))).confidence).toBe("Normal");
  });
  it("no_stop_loss cost is losses above the usual loss, never below zero", () => {
    const mk = (pnls: number[], sl: boolean[]) => pnls.map((p, i) => fakeTrade(i, { netPnl: p, hadStopLoss: sl[i] }));
    const h = detectNoStopLoss(mk([-100, -100, -100, -1000, -1000, -1000], [true, true, true, false, false, false]));
    // median loss = 550; three losses of 1000 → 3000 − 3×550 = 1350
    expect(h.cost_rupees).toBe(1350);
    expect(h.triggered).toBe(true);
    const flat = detectNoStopLoss(mk([-500, -500, -500, -500], [false, false, false, false]));
    expect(flat.cost_rupees).toBe(0);
    expect(flat.triggered).toBe(false);
  });
  it("holding_losers needs a 1.5x ratio", () => {
    const mk = (loserHold: number) => [
      ...[1, 2, 3, 4].map((i) => fakeTrade(i, { netPnl: 100, holdMinutes: 10 })),
      ...[5, 6, 7, 8].map((i) => fakeTrade(i, { netPnl: -400, holdMinutes: loserHold })),
    ];
    const find = (ts: Trade[]) => detectHabits(ts).find((h) => h.id === "holding_losers")!;
    expect(find(mk(14)).triggered).toBe(false);
    expect(find(mk(30)).triggered).toBe(true);
    expect(find(mk(30)).affected_trade_ids).toHaveLength(4);
    expect(find(mk(19)).triggered).toBe(false); // 1.9× but nothing over 2× the winner time
  });
  it("revenge needs a loss within 30 min and a size of 1.5x the median", () => {
    const base = [1, 2, 3, 4, 5, 6].map((i) => fakeTrade(i * 100, { netPnl: 50, entryTime: Date.UTC(2026, 8, 2, 9, i * 40), exitTime: Date.UTC(2026, 8, 2, 9, i * 40 + 5) }));
    const loser = fakeTrade(1, { netPnl: -100, entryTime: Date.UTC(2026, 8, 3, 10, 0), exitTime: Date.UTC(2026, 8, 3, 10, 10) });
    const big = (i: number, minAfter: number) =>
      fakeTrade(900 + i, { netPnl: -300, positionValue: 20000, entryTime: Date.UTC(2026, 8, 3, 10, 10 + minAfter), exitTime: Date.UTC(2026, 8, 3, 10, 40 + minAfter) });
    const find = (ts: Trade[]) => detectHabits(ts).find((h) => h.id === "revenge")!;
    expect(find([...base, loser, big(1, 5), big(2, 20), big(3, 30)]).affected_trade_ids).toEqual(expect.arrayContaining(["t901", "t902", "t903"]));
    expect(find([...base, loser, big(1, 5), big(2, 20), big(3, 31)]).triggered).toBe(false);
  });
  it("ranks by cost and keeps nothing when nothing triggers", () => {
    expect(rankHabits(detectHabits([]))).toEqual([]);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

describe("wording", () => {
  const facts: Facts = { habit: "expiry_day", cost_rupees: 4310, affected_trades: 9, experiment_weeks: 2 };
  const good = { headline: "Expiry days are costing you", what_we_saw: "You opened 9 trades on expiry day. They lost ₹4,310.", try_this: "Skip expiry day for 2 weeks." };
  const check = (o: unknown) => {
    const v = validateWording(typeof o === "string" ? o : JSON.stringify(o), facts);
    return v.ok ? "ok" : v.check;
  };
  it("accepts a clean answer", () => expect(check(good)).toBe("ok"));
  it("rejects each kind of failure", () => {
    expect(check("not json")).toBe("json_parse");
    expect(check({ headline: "x" })).toBe("schema");
    expect(check({ ...good, headline: "one two three four five six seven eight nine" })).toBe("word_limit");
    expect(check({ ...good, what_we_saw: "You lost ₹4,311 on 9 trades." })).toBe("number_not_in_facts");
    expect(check({ ...good, what_we_saw: "You opened 9 trades on expiry day." })).toBe("missing_cost");
    expect(check({ ...good, try_this: "Skip expiry day for two weeks." })).toBe("number_word");
    for (const bad of ["Buy less often.", "Pick a better strike.", "Sell sooner.", "Aim for a target.", "NIFTY will go up.", "We recommend rest."]) {
      expect(check({ ...good, try_this: bad })).toBe("forbidden_word");
    }
  });
  it("allows commas and rupee signs but not made-up maths", () => {
    expect(check({ ...good, what_we_saw: "They lost ₹4310 across 9 trades." })).toBe("ok");
    expect(check({ ...good, what_we_saw: "They lost ₹4,310, about ₹479 each." })).toBe("number_not_in_facts");
  });
  it("every template passes the same checks, for every habit", () => {
    for (const s of SAMPLE_SPECS) {
      for (const h of analyze(buildSample(s.key).csv, s.name).top) {
        const w = templateWording(h.facts);
        expect(validateWording(JSON.stringify(w), h.facts), `${s.name} ${h.id}`).toMatchObject({ ok: true });
      }
    }
    for (const p of ADVERSARIAL_PAYLOADS) {
      expect(validateWording(JSON.stringify(templateWording(p.facts)), p.facts)).toMatchObject({ ok: true });
    }
  });
  it("falls back to the template and records the failed check", async () => {
    const r = await resolveWording(facts, { aiOn: true, fetcher: async () => ({ raw: JSON.stringify({ ...good, try_this: "Buy calls." }) }) });
    expect(r.source).toBe("template");
    expect(r.failedCheck).toBe("forbidden_word");
    const down = await resolveWording(facts, { aiOn: true, fetcher: async () => ({ error: "boom" }) });
    expect(down.failedCheck).toBe("ai_unavailable");
    const off = await resolveWording(facts, { aiOn: false });
    expect(off.aiAttempted).toBe(false);
    const ok = await resolveWording(facts, { aiOn: true, fetcher: async () => ({ raw: JSON.stringify(good) }) });
    expect(ok.source).toBe("ai");
  });
  it("advice filter is case-insensitive", () => expect(adviceFilter("Should I SELL?")).toBe("sell"));
});

describe("sample datasets", () => {
  it("are deterministic", () => {
    expect(buildSample("a").csv).toBe(buildSample("a").csv);
    expect(buildSample("a").csv).not.toBe(buildSample("b").csv);
  });
  it("have 40–80 round trips and charges on every completed order", () => {
    for (const s of SAMPLE_SPECS) {
      const a = analyze(buildSample(s.key).csv, s.name);
      expect(a.trades.length, s.name).toBeGreaterThanOrEqual(40);
      expect(a.trades.length, s.name).toBeLessThanOrEqual(80);
      expect(a.parse.orders.filter((o) => o.status === "COMPLETE").every((o) => o.charges > 0)).toBe(true);
    }
  });
  it("all pass the test bench", () => {
    for (const r of runAllEvals()) expect(r, r.name).toMatchObject({ pass: true });
  });
  it("Disciplined Dev finds nothing, honestly", () => {
    const a = analyze(buildSample("d").csv, "d");
    expect(a.top).toEqual([]);
    expect(a.summary.netPnl).toBeGreaterThan(0);
  });
});
