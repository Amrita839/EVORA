import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyze } from "./pipeline";

// 13 orders (2 cancelled stop-losses), worked out by hand: 6 trades, one habit.
describe("golden file", () => {
  const a = analyze(readFileSync(new URL("./fixtures/golden.csv", import.meta.url), "utf8"), "golden");
  it("summary", () => {
    expect(a.summary.netPnl).toBeCloseTo(-3595);
    expect(a.summary.trades).toBe(6);
    expect(a.summary.winRatePct).toBeCloseTo(33.33, 1);
    expect(a.summary.totalCharges).toBeCloseTo(220);
    expect(a.errors).toHaveLength(0);
  });
  it("trades", () => {
    expect(a.trades.map((t) => [t.strike, t.instrument, t.entryClock, t.exitClock, t.qty, Math.round(t.netPnl), t.hadStopLoss])).toEqual([
      [25000, "CE", "10:00", "11:00", 75, 1470, false],
      [25000, "CE", "10:00", "13:00", 75, -780, false],
      [25000, "CE", "09:20", "10:00", 75, -1540, true],
      [25100, "CE", "10:30", "11:15", 75, -790, true],
      [24900, "PE", "12:00", "13:00", 75, 335, false],
      [25000, "PE", "14:00", "14:45", 75, -2290, false],
    ]);
  });
  it("only expiry-day shows", () => {
    expect(a.top.map((h) => [h.id, Math.round(h.cost_rupees), h.affected_trade_ids.length, h.confidence])).toEqual([["expiry_day", 4285, 4, "Low"]]);
  });
});
