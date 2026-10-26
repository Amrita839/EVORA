export type Instrument = "CE" | "PE" | "FUT";
export type Side = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "SL" | "SL-M";
export type OrderStatus = "COMPLETE" | "CANCELLED" | "REJECTED";

export const REQUIRED_COLUMNS = [
  "order_id",
  "timestamp",
  "symbol",
  "instrument",
  "strike",
  "expiry",
  "side",
  "quantity",
  "price",
  "order_type",
  "status",
  "underlying_price",
  "charges",
] as const;

export interface Order {
  orderId: string;
  /** Line number in the file (header is line 1). */
  line: number;
  /** "YYYY-MM-DD HH:mm:ss" as written (IST). */
  timestamp: string;
  /** IST wall-clock time as epoch ms, treating the string as UTC. Only used for differences and ordering. */
  ts: number;
  date: string;
  symbol: string;
  instrument: Instrument;
  strike: number | null;
  expiry: string;
  side: Side;
  quantity: number;
  price: number;
  orderType: OrderType;
  status: OrderStatus;
  underlying: number;
  charges: number;
}

export type RowErrorKind =
  | "missing_column"
  | "wrong_column_count"
  | "missing_value"
  | "bad_date"
  | "bad_number"
  | "bad_value"
  | "duplicate_order_id"
  | "unmatched_exit";

export interface RowError {
  /** 0 for file-level problems. */
  line: number;
  kind: RowErrorKind;
  message: string;
  orderId?: string;
}

export interface ParseResult {
  /** Set when the file cannot be read at all (e.g. a column is missing). */
  fatal: string | null;
  missingColumns: string[];
  /** Valid orders, including CANCELLED and REJECTED ones. */
  orders: Order[];
  errors: RowError[];
  /** Data rows seen (blank lines excluded). */
  totalRows: number;
  cancelledIgnored: number;
  rejectedIgnored: number;
}

export type MoneynessLabel = "FUT" | "ITM" | "ATM" | "OTM" | "FAR_OTM";

export interface Trade {
  /** Order id of the entry order. */
  id: string;
  contract: string;
  symbol: string;
  instrument: Instrument;
  strike: number | null;
  expiry: string;
  direction: "long" | "short";
  entryTime: number;
  exitTime: number;
  /** "YYYY-MM-DD" of entry. */
  entryDate: string;
  entryClock: string;
  exitClock: string;
  holdMinutes: number;
  qty: number;
  entryAvgPrice: number;
  exitAvgPrice: number;
  grossPnl: number;
  charges: number;
  netPnl: number;
  hadStopLoss: boolean;
  moneyness: MoneynessLabel;
  /** |strike - underlying| / underlying, as a fraction. null for futures. */
  distance: number | null;
  underlyingAtEntry: number;
  positionValue: number;
}

export interface MatchResult {
  trades: Trade[];
  openPositions: number;
  errors: RowError[];
}

export type HabitId =
  | "expiry_day"
  | "revenge"
  | "holding_losers"
  | "far_otm"
  | "overtrading"
  | "no_stop_loss";

export type Confidence = "Low" | "Normal";

export type Facts = { habit: HabitId } & Record<string, number | string>;

export interface Habit {
  id: HabitId;
  triggered: boolean;
  /** Positive = money lost. */
  cost_rupees: number;
  affected_trade_ids: string[];
  facts: Facts;
  confidence: Confidence;
}

export interface Wording {
  headline: string;
  what_we_saw: string;
  try_this: string;
}
