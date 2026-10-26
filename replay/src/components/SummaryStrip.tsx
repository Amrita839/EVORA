import type { Summary } from "../lib/matchTrades";
import { rupees, signedRupees } from "../lib/format";

export default function SummaryStrip({ s }: { s: Summary }) {
  const items = [
    { label: "Net P&L", value: signedRupees(s.netPnl), tone: s.netPnl < 0 ? "text-loss" : "text-gain" },
    { label: "Trades", value: String(s.trades), tone: "" },
    { label: "Win rate", value: `${Math.round(s.winRatePct)}%`, tone: "" },
    { label: "Total charges", value: rupees(s.totalCharges), tone: "" },
  ];
  return (
    <dl className="tabular grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-xs text-muted">{i.label}</dt>
          <dd className={`font-medium ${i.tone}`}>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
