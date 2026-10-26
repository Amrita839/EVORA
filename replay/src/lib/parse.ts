import {
  REQUIRED_COLUMNS,
  type Instrument,
  type OrderStatus,
  type OrderType,
  type ParseResult,
  type RowError,
  type Side,
} from "./types";

/** Splits CSV text into rows of fields. Handles quotes, escaped quotes, CRLF and a leading BOM. */
export function splitCsv(text: string): { fields: string[]; line: number }[] {
  const rows: { fields: string[]; line: number }[] = [];
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  let field = "";
  let fields: string[] = [];
  let inQuotes = false;
  let line = 1;
  let rowStart = 1;
  const endRow = () => {
    fields.push(field);
    field = "";
    if (fields.length > 1 || fields[0].trim() !== "") rows.push({ fields, line: rowStart });
    fields = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else {
        if (c === "\n") line++;
        field += c;
      }
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      fields.push(field);
      field = "";
    } else if (c === "\r") {
      // swallowed; "\n" ends the row
    } else if (c === "\n") {
      endRow();
      line++;
      rowStart = line;
    } else field += c;
  }
  if (field !== "" || fields.length > 0) endRow();
  return rows;
}

const TS_RE = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Returns epoch ms (IST wall clock read as UTC) or null if the string is not a real date-time. */
export function parseTimestamp(s: string): number | null {
  const m = TS_RE.exec(s);
  if (!m) return null;
  const [y, mo, d, h, mi, se] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi, se);
  const back = new Date(t);
  if (
    back.getUTCFullYear() !== y ||
    back.getUTCMonth() !== mo - 1 ||
    back.getUTCDate() !== d ||
    h > 23 ||
    mi > 59 ||
    se > 59
  )
    return null;
  return t;
}

export function isRealDate(s: string): boolean {
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  const back = new Date(Date.UTC(y, mo - 1, d));
  return back.getUTCFullYear() === y && back.getUTCMonth() === mo - 1 && back.getUTCDate() === d;
}

const NUM_RE = /^-?\d+(\.\d+)?$/;
const toNumber = (s: string): number | null => {
  const clean = s.replace(/,/g, "").trim();
  return NUM_RE.test(clean) ? Number(clean) : null;
};

const INSTRUMENTS: Instrument[] = ["CE", "PE", "FUT"];
const SIDES: Side[] = ["BUY", "SELL"];
const ORDER_TYPES: OrderType[] = ["MARKET", "LIMIT", "SL", "SL-M"];
const STATUSES: OrderStatus[] = ["COMPLETE", "CANCELLED", "REJECTED"];

export function parseOrdersCsv(text: string): ParseResult {
  const result: ParseResult = {
    fatal: null,
    missingColumns: [],
    orders: [],
    errors: [],
    totalRows: 0,
    cancelledIgnored: 0,
    rejectedIgnored: 0,
  };
  const rows = splitCsv(text);
  if (rows.length === 0) {
    result.fatal = "The file is empty.";
    return result;
  }
  const header = rows[0].fields.map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    result.missingColumns = [...missing];
    result.fatal = `Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Download the template to see the format.`;
    result.errors.push({ line: 1, kind: "missing_column", message: result.fatal });
    return result;
  }
  const idx = Object.fromEntries(REQUIRED_COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<
    (typeof REQUIRED_COLUMNS)[number],
    number
  >;
  const seenIds = new Set<string>();

  for (const row of rows.slice(1)) {
    result.totalRows++;
    const line = row.line;
    const fail = (kind: RowError["kind"], message: string, orderId?: string) => {
      result.errors.push({ line, kind, message: `Row ${line}: ${message}`, orderId });
    };
    if (row.fields.length !== header.length) {
      fail("wrong_column_count", `has ${row.fields.length} values but the file has ${header.length} columns.`);
      continue;
    }
    const get = (c: (typeof REQUIRED_COLUMNS)[number]) => (row.fields[idx[c]] ?? "").trim();
    const orderId = get("order_id");
    if (!orderId) {
      fail("missing_value", "order_id is empty.");
      continue;
    }
    if (seenIds.has(orderId)) {
      fail("duplicate_order_id", `order_id ${orderId} appears more than once. Kept the first one.`, orderId);
      continue;
    }

    // Structural fields: always required.
    const ts = parseTimestamp(get("timestamp"));
    if (get("timestamp") === "") {
      fail("missing_value", "timestamp is empty.", orderId);
      continue;
    }
    if (ts === null) {
      fail("bad_date", `"${get("timestamp")}" is not a real date. Use YYYY-MM-DD HH:mm:ss.`, orderId);
      continue;
    }
    const symbol = get("symbol").toUpperCase();
    if (!symbol) {
      fail("missing_value", "symbol is empty.", orderId);
      continue;
    }
    const instrument = get("instrument").toUpperCase() as Instrument;
    if (!INSTRUMENTS.includes(instrument)) {
      fail("bad_value", `instrument "${get("instrument")}" is not CE, PE or FUT.`, orderId);
      continue;
    }
    const expiry = get("expiry");
    if (!isRealDate(expiry)) {
      fail(expiry === "" ? "missing_value" : "bad_date", expiry === "" ? "expiry is empty." : `expiry "${expiry}" is not a real date. Use YYYY-MM-DD.`, orderId);
      continue;
    }
    let strike: number | null = null;
    if (instrument !== "FUT") {
      if (get("strike") === "") {
        fail("missing_value", "strike is empty for an option.", orderId);
        continue;
      }
      strike = toNumber(get("strike"));
      if (strike === null || strike <= 0) {
        fail("bad_number", `strike "${get("strike")}" is not a number.`, orderId);
        continue;
      }
    }
    const side = get("side").toUpperCase() as Side;
    if (!SIDES.includes(side)) {
      fail("bad_value", `side "${get("side")}" is not BUY or SELL.`, orderId);
      continue;
    }
    const orderType = get("order_type").toUpperCase() as OrderType;
    if (!ORDER_TYPES.includes(orderType)) {
      fail("bad_value", `order_type "${get("order_type")}" is not MARKET, LIMIT, SL or SL-M.`, orderId);
      continue;
    }
    const status = get("status").toUpperCase() as OrderStatus;
    if (!STATUSES.includes(status)) {
      fail("bad_value", `status "${get("status")}" is not COMPLETE, CANCELLED or REJECTED.`, orderId);
      continue;
    }
    if (get("quantity") === "") {
      fail("missing_value", "quantity is empty.", orderId);
      continue;
    }
    const quantity = toNumber(get("quantity"));
    if (quantity === null || quantity <= 0) {
      fail("bad_number", `quantity "${get("quantity")}" is not a number above zero.`, orderId);
      continue;
    }

    // Money fields: required for COMPLETE orders. A cancelled or rejected order may leave them blank.
    const needMoney = status === "COMPLETE";
    const moneyField = (c: "price" | "underlying_price" | "charges"): number | null | "bad" => {
      const raw = get(c);
      if (raw === "") {
        if (needMoney) {
          fail("missing_value", `${c} is empty.`, orderId);
          return "bad";
        }
        return 0;
      }
      const n = toNumber(raw);
      if (n === null || n < 0) {
        fail("bad_number", `${c} "${raw}" is not a number.`, orderId);
        return "bad";
      }
      return n;
    };
    const price = moneyField("price");
    if (price === "bad") continue;
    const underlying = moneyField("underlying_price");
    if (underlying === "bad") continue;
    const charges = moneyField("charges");
    if (charges === "bad") continue;
    if (needMoney && (price === 0 || (instrument !== "FUT" && underlying === 0))) {
      fail("bad_number", `${price === 0 ? "price" : "underlying_price"} must be above zero.`, orderId);
      continue;
    }

    seenIds.add(orderId);
    if (status === "CANCELLED") result.cancelledIgnored++;
    if (status === "REJECTED") result.rejectedIgnored++;
    result.orders.push({
      orderId,
      line,
      timestamp: get("timestamp"),
      ts,
      date: get("timestamp").slice(0, 10),
      symbol,
      instrument,
      strike,
      expiry,
      side,
      quantity,
      price: price as number,
      orderType,
      status,
      underlying: underlying as number,
      charges: charges as number,
    });
  }
  return result;
}

export const CSV_TEMPLATE = [
  REQUIRED_COLUMNS.join(","),
  "T0001,2026-09-02 09:32:10,NIFTY,CE,24500,2026-09-08,BUY,65,120.50,MARKET,COMPLETE,24410.25,38.40",
  "T0002,2026-09-02 09:32:15,NIFTY,CE,24500,2026-09-08,SELL,65,102.00,SL,CANCELLED,24410.25,0",
  "T0003,2026-09-02 10:05:40,NIFTY,CE,24500,2026-09-08,SELL,65,131.75,MARKET,COMPLETE,24455.00,41.10",
  "",
].join("\n");
