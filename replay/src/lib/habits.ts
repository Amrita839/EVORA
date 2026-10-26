import { FAR_OTM_DISTANCE } from "./matchTrades";
import type { Confidence, Facts, Habit, HabitId, Trade } from "./types";

// Thresholds. Everything the detectors use lives here so the rule text and the code cannot drift apart.
export const MIN_AFFECTED_TRADES = 3;
export const MIN_COST_RUPEES = 500;
export const LOW_CONFIDENCE_BELOW = 5;
export const MAX_HABITS_SHOWN = 3;
export const REVENGE_WINDOW_MINUTES = 30;
export const REVENGE_SIZE_MULTIPLE = 1.5;
export const HOLD_TRIGGER_RATIO = 1.5;
export const HOLD_LOSER_MULTIPLE = 2;
export const OVERTRADING_DAY_LIMIT = 10;
/** A constant, not a measurement. Passed in the facts so the wording may say "for 2 weeks". */
export const EXPERIMENT_WEEKS = 2;

export const HABIT_ORDER: HabitId[] = [
  "expiry_day",
  "revenge",
  "holding_losers",
  "far_otm",
  "overtrading",
  "no_stop_loss",
];

const GATE = `shown only if at least ${MIN_AFFECTED_TRADES} such trades lost ₹${MIN_COST_RUPEES} or more together`;

export const HABIT_INFO: Record<HabitId, { costLabel: string; rule: string }> = {
  expiry_day: {
    costLabel: "lost on trades opened on expiry day",
    rule: `Trades you opened on the contract's expiry day (its last trading day), ${GATE}.`,
  },
  revenge: {
    costLabel: "lost on bigger trades right after a loss",
    rule: `Trades opened within ${REVENGE_WINDOW_MINUTES} minutes after a loss closed, at least ${REVENGE_SIZE_MULTIPLE}× your usual size, ${GATE}.`,
  },
  holding_losers: {
    costLabel: "lost on losers held much longer than winners",
    rule: `Losers held over ${HOLD_LOSER_MULTIPLE}× your usual winner's time, counted only if your usual loser lasts ${HOLD_TRIGGER_RATIO}× as long as your usual winner, ${GATE}.`,
  },
  far_otm: {
    costLabel: "lost on options far from the market price",
    rule: `Options you bought that were out of the money (not worth using yet) and over ${FAR_OTM_DISTANCE * 100}% away from the market price, ${GATE}.`,
  },
  overtrading: {
    costLabel: "lost on days with too many trades",
    rule: `Every trade on days with more than ${OVERTRADING_DAY_LIMIT} round trips (an entry plus its exit), ${GATE}.`,
  },
  no_stop_loss: {
    costLabel: "losses bigger than your usual loss on trades with no stop-loss",
    rule: `For losing trades with no stop-loss (an order that exits early), how much each loss was above your usual loss (the middle one), ${GATE}.`,
  },
};

export const median = (xs: number[]): number => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const r0 = Math.round;
const r1 = (n: number) => Math.round(n * 10) / 10;
const confidenceFor = (n: number): Confidence => (n < LOW_CONFIDENCE_BELOW ? "Low" : "Normal");

function build(
  id: HabitId,
  affected: Trade[],
  cost: number,
  facts: Record<string, number | string>,
  conditionMet = true,
): Habit {
  const net = sum(affected.map((t) => t.netPnl));
  const triggered =
    conditionMet && affected.length >= MIN_AFFECTED_TRADES && net < 0 && cost >= MIN_COST_RUPEES;
  return {
    id,
    triggered,
    cost_rupees: Math.max(0, cost),
    affected_trade_ids: affected.map((t) => t.id),
    facts: {
      habit: id,
      cost_rupees: r0(Math.max(0, cost)),
      affected_trades: affected.length,
      experiment_weeks: EXPERIMENT_WEEKS,
      ...facts,
    } as Facts,
    confidence: confidenceFor(affected.length),
  };
}

const lossOf = (t: Trade) => -t.netPnl;
const costOf = (ts: Trade[]) => -sum(ts.map((t) => t.netPnl));
const winRate = (ts: Trade[]) => (ts.length ? (ts.filter((t) => t.netPnl > 0).length / ts.length) * 100 : 0);

export function detectExpiryDay(trades: Trade[]): Habit {
  const affected = trades.filter((t) => t.entryDate === t.expiry);
  const cost = costOf(affected);
  return build("expiry_day", affected, cost, {
    total_trades: trades.length,
    expiry_day_win_rate_pct: r0(winRate(affected)),
    avg_loss_per_trade_rupees: affected.length ? r0(Math.max(0, cost) / affected.length) : 0,
  });
}

export function detectRevenge(trades: Trade[]): Habit {
  const losers = trades.filter((t) => t.netPnl < 0);
  const usual = median(trades.map((t) => t.positionValue));
  const window = REVENGE_WINDOW_MINUTES * 60000;
  const affected = trades.filter(
    (t) =>
      t.positionValue >= REVENGE_SIZE_MULTIPLE * usual &&
      losers.some((l) => l.id !== t.id && l.exitTime <= t.entryTime && t.entryTime - l.exitTime <= window),
  );
  return build("revenge", affected, costOf(affected), {
    window_minutes: REVENGE_WINDOW_MINUTES,
    size_multiple: REVENGE_SIZE_MULTIPLE,
    usual_position_rupees: r0(usual),
    avg_revenge_position_rupees: affected.length ? r0(sum(affected.map((t) => t.positionValue)) / affected.length) : 0,
  });
}

export function detectHoldingLosers(trades: Trade[]): Habit {
  const losers = trades.filter((t) => t.netPnl < 0);
  const winners = trades.filter((t) => t.netPnl > 0);
  const loserHold = median(losers.map((t) => t.holdMinutes));
  const winnerHold = median(winners.map((t) => t.holdMinutes));
  const met = losers.length > 0 && winners.length > 0 && winnerHold > 0 && loserHold >= HOLD_TRIGGER_RATIO * winnerHold;
  const affected = met ? losers.filter((t) => t.holdMinutes > HOLD_LOSER_MULTIPLE * winnerHold) : [];
  return build(
    "holding_losers",
    affected,
    costOf(affected),
    {
      median_loser_hold_minutes: r0(loserHold),
      median_winner_hold_minutes: r0(winnerHold),
      hold_ratio: winnerHold > 0 ? r1(loserHold / winnerHold) : 0,
      trigger_ratio: HOLD_TRIGGER_RATIO,
      loser_hold_multiple: HOLD_LOSER_MULTIPLE,
    },
    met,
  );
}

export function detectFarOtm(trades: Trade[]): Habit {
  const affected = trades.filter(
    (t) => t.direction === "long" && t.instrument !== "FUT" && t.moneyness === "FAR_OTM",
  );
  return build("far_otm", affected, costOf(affected), {
    far_otm_threshold_pct: FAR_OTM_DISTANCE * 100,
    winners: affected.filter((t) => t.netPnl > 0).length,
    win_rate_pct: r0(winRate(affected)),
  });
}

export function detectOvertrading(trades: Trade[]): Habit {
  const byDay = new Map<string, Trade[]>();
  for (const t of trades) byDay.set(t.entryDate, [...(byDay.get(t.entryDate) ?? []), t]);
  const heavy = [...byDay.values()].filter((d) => d.length > OVERTRADING_DAY_LIMIT);
  const affected = heavy.flat().sort((a, b) => a.entryTime - b.entryTime);
  return build("overtrading", affected, costOf(affected), {
    day_limit: OVERTRADING_DAY_LIMIT,
    heavy_days: heavy.length,
    max_trades_in_a_day: heavy.length ? Math.max(...heavy.map((d) => d.length)) : 0,
    charges_rupees: r0(sum(affected.map((t) => t.charges))),
  });
}

export function detectNoStopLoss(trades: Trade[]): Habit {
  const losers = trades.filter((t) => t.netPnl < 0);
  const usual = median(losers.map(lossOf));
  const affected = losers.filter((t) => !t.hadStopLoss);
  const totalLoss = sum(affected.map(lossOf));
  const cost = Math.max(0, totalLoss - affected.length * usual);
  return build("no_stop_loss", affected, cost, {
    total_loss_rupees: r0(totalLoss),
    usual_loss_rupees: r0(usual),
    losing_trades: losers.length,
  });
}

/** Runs every detector. `triggered` already includes the shared thresholds. */
export function detectHabits(trades: Trade[]): Habit[] {
  return [
    detectExpiryDay(trades),
    detectRevenge(trades),
    detectHoldingLosers(trades),
    detectFarOtm(trades),
    detectOvertrading(trades),
    detectNoStopLoss(trades),
  ];
}

/** Triggered habits, biggest cost first. Ties keep the fixed detector order. */
export function rankHabits(habits: Habit[]): Habit[] {
  return habits
    .filter((h) => h.triggered)
    .sort((a, b) => b.cost_rupees - a.cost_rupees || HABIT_ORDER.indexOf(a.id) - HABIT_ORDER.indexOf(b.id));
}

export const topHabits = (habits: Habit[]) => rankHabits(habits).slice(0, MAX_HABITS_SHOWN);
