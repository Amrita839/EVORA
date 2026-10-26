import type { MatchResult, MoneynessLabel, Order, RowError, Trade } from "./types";

export const FAR_OTM_DISTANCE = 0.02;
const ATM_DISTANCE = 0.0025;

export const contractKey = (o: Pick<Order, "symbol" | "instrument" | "strike" | "expiry">) =>
  `${o.symbol}|${o.instrument}|${o.strike ?? ""}|${o.expiry}`;

export function describeContract(t: Pick<Trade, "symbol" | "instrument" | "strike" | "expiry">): string {
  const [, m, d] = t.expiry.split("-");
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1];
  return t.instrument === "FUT"
    ? `${t.symbol} FUT · ${Number(d)} ${mon}`
    : `${t.symbol} ${t.strike} ${t.instrument} · ${Number(d)} ${mon}`;
}

/** Distance from spot and whether an option is out of the money. Far OTM = OTM and more than 2% away. */
export function classifyMoneyness(
  instrument: Trade["instrument"],
  strike: number | null,
  underlying: number,
): { label: MoneynessLabel; distance: number | null } {
  if (instrument === "FUT" || strike === null) return { label: "FUT", distance: null };
  const distance = Math.abs(strike - underlying) / underlying;
  const otm = instrument === "CE" ? strike > underlying : strike < underlying;
  if (!otm) return { label: distance <= ATM_DISTANCE ? "ATM" : "ITM", distance };
  if (distance > FAR_OTM_DISTANCE) return { label: "FAR_OTM", distance };
  return { label: distance <= ATM_DISTANCE ? "ATM" : "OTM", distance };
}

interface Slice {
  orderId: string;
  qty: number;
  price: number;
  ts: number;
  /** Charges of the exit order, shared out by quantity. */
  charges: number;
}

interface Lot {
  order: Order;
  direction: "long" | "short";
  remaining: number;
  slices: Slice[];
}

const isStop = (o: Order) => o.orderType === "SL" || o.orderType === "SL-M";

/**
 * Turns orders into round-trip trades, matching exits to entries first-in-first-out.
 * One trade = one entry (or part of it) closed by one exit. Open leftovers are not counted.
 */
export function matchTrades(orders: Order[]): MatchResult {
  const errors: RowError[] = [];
  const sorted = [...orders].sort((a, b) => a.ts - b.ts || a.line - b.line);
  const queues = new Map<string, Lot[]>();
  const finished: Lot[] = [];

  // Stop-loss orders that were set (pending, cancelled or hit). Rejected ones never protected anything.
  const stopsByContract = new Map<string, Order[]>();
  for (const o of sorted) {
    if (isStop(o) && o.status !== "REJECTED") {
      const k = contractKey(o);
      stopsByContract.set(k, [...(stopsByContract.get(k) ?? []), o]);
    }
  }

  for (const o of sorted) {
    if (o.status !== "COMPLETE") continue;
    const key = contractKey(o);
    const queue = queues.get(key) ?? [];
    queues.set(key, queue);
    const openSide = queue.length > 0 ? queue[0].direction : null;
    const closes = openSide !== null && (openSide === "long" ? o.side === "SELL" : o.side === "BUY");

    if (closes) {
      let left = o.quantity;
      while (left > 1e-9 && queue.length > 0) {
        const lot = queue[0];
        const take = Math.min(left, lot.remaining);
        lot.slices.push({ orderId: o.orderId, qty: take, price: o.price, ts: o.ts, charges: (o.charges * take) / o.quantity });
        lot.remaining -= take;
        left -= take;
        if (lot.remaining <= 1e-9) {
          finished.push(lot);
          queue.shift();
        }
      }
      if (left > 1e-9) {
        errors.push({
          line: o.line,
          kind: "unmatched_exit",
          orderId: o.orderId,
          message: `Row ${o.line}: exit of ${left} units has no matching entry. Skipped.`,
        });
      }
    } else if (isStop(o)) {
      errors.push({
        line: o.line,
        kind: "unmatched_exit",
        orderId: o.orderId,
        message: `Row ${o.line}: this stop-loss order was filled but there was no open position to exit. Skipped.`,
      });
    } else {
      queue.push({ order: o, direction: o.side === "BUY" ? "long" : "short", remaining: o.quantity, slices: [] });
    }
  }

  let openPositions = 0;
  for (const queue of queues.values()) {
    if (queue.length > 0) openPositions++;
    // A lot that was only partly closed still has a finished part.
    for (const lot of queue) if (lot.slices.length > 0) finished.push(lot);
  }

  // One trade per matched exit: a buy of 150 sold as 75 + 75 is two trades.
  const trades: Trade[] = finished.flatMap((lot) =>
    lot.slices.map((slice) => {
      const e = lot.order;
      const sign = lot.direction === "long" ? 1 : -1;
      const qty = slice.qty;
      const gross = (slice.price - e.price) * qty * sign;
      const charges = (e.charges * qty) / e.quantity + slice.charges;
      const exitSide = lot.direction === "long" ? "SELL" : "BUY";
      const hadStopLoss = (stopsByContract.get(contractKey(e)) ?? []).some(
        (st) => st.side === exitSide && st.ts >= e.ts && st.ts <= slice.ts,
      );
      const m = classifyMoneyness(e.instrument, e.strike, e.underlying);
      const t: Trade = {
        id: lot.slices.length > 1 ? `${e.orderId}/${slice.orderId}` : e.orderId,
        contract: contractKey(e),
        symbol: e.symbol,
        instrument: e.instrument,
        strike: e.strike,
        expiry: e.expiry,
        direction: lot.direction,
        entryTime: e.ts,
        exitTime: slice.ts,
        entryDate: e.date,
        entryClock: e.timestamp.slice(11, 16),
        exitClock: new Date(slice.ts).toISOString().slice(11, 16),
        holdMinutes: (slice.ts - e.ts) / 60000,
        qty,
        entryAvgPrice: e.price,
        exitAvgPrice: slice.price,
        grossPnl: gross,
        charges,
        netPnl: gross - charges,
        hadStopLoss,
        moneyness: m.label,
        distance: m.distance,
        underlyingAtEntry: e.underlying,
        positionValue: qty * e.price,
      };
      return t;
    }),
  );
  trades.sort((a, b) => a.entryTime - b.entryTime || a.exitTime - b.exitTime || a.id.localeCompare(b.id));
  return { trades, openPositions, errors };
}

export interface Summary {
  netPnl: number;
  trades: number;
  winRatePct: number;
  totalCharges: number;
}

export function summarizeTrades(trades: Trade[]): Summary {
  const wins = trades.filter((t) => t.netPnl > 0).length;
  return {
    netPnl: trades.reduce((s, t) => s + t.netPnl, 0),
    trades: trades.length,
    winRatePct: trades.length ? (wins / trades.length) * 100 : 0,
    totalCharges: trades.reduce((s, t) => s + t.charges, 0),
  };
}
