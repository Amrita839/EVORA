import { detectHabits, topHabits } from "./habits";
import { matchTrades, summarizeTrades, type Summary } from "./matchTrades";
import { parseOrdersCsv } from "./parse";
import type { Habit, ParseResult, RowError, Trade } from "./types";

export interface Analysis {
  name: string;
  parse: ParseResult;
  trades: Trade[];
  summary: Summary;
  openPositions: number;
  /** Parse errors plus unmatched exits, in line order. */
  errors: RowError[];
  /** Every detector's output. */
  habits: Habit[];
  /** Triggered habits, ranked, at most 3. */
  top: Habit[];
}

export function analyze(csv: string, name: string): Analysis {
  const parse = parseOrdersCsv(csv);
  const match = parse.fatal ? { trades: [], openPositions: 0, errors: [] } : matchTrades(parse.orders);
  const habits = detectHabits(match.trades);
  return {
    name,
    parse,
    trades: match.trades,
    summary: summarizeTrades(match.trades),
    openPositions: match.openPositions,
    errors: [...parse.errors, ...match.errors].sort((a, b) => a.line - b.line),
    habits,
    top: topHabits(habits),
  };
}
