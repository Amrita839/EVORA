import { Link } from "react-router-dom";
import { describeContract } from "../lib/matchTrades";
import { rupees, shortDate, signedRupees } from "../lib/format";
import { useStore } from "../state";

/** Every round trip and every detector's raw result for the file that is open. For checking numbers by hand. */
export default function Debug() {
  const { analysis: a } = useStore();
  if (!a) {
    return (
      <p className="text-muted">
        Open a file or sample first. <Link to="/" className="underline">Go to Home</Link>
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <Link to="/results" className="text-sm text-muted underline-offset-2 hover:underline">← Results</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Debug · {a.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {a.trades.length} round trips, {a.openPositions} open, {a.errors.length} skipped rows. Net {signedRupees(a.summary.netPnl)}, charges {rupees(a.summary.totalCharges)}.
        </p>
      </div>
      <section>
        <h2 className="mb-2 font-medium">Habit checks</h2>
        <ul className="space-y-1 text-sm">
          {a.habits.map((h) => (
            <li key={h.id} className="flex justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2">
              <span>{h.id}</span>
              <span className="tabular text-muted">
                {h.triggered ? "shown" : "not shown"} · {h.affected_trade_ids.length} trades · {rupees(h.cost_rupees)} · {h.confidence}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-medium">All trades</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="tabular w-full whitespace-nowrap text-left text-xs">
            <thead className="border-b border-line text-muted">
              <tr>
                {["Contract", "Entry → Exit", "Qty", "Charges", "Net P&L", "Stop-loss set?", "Moneyness"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {a.trades.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-1.5">{describeContract(t)}</td>
                  <td className="px-3 py-1.5">
                    {shortDate(t.entryDate)} {t.entryClock} → {t.exitClock}
                  </td>
                  <td className="px-3 py-1.5">{t.qty}</td>
                  <td className="px-3 py-1.5">{rupees(t.charges)}</td>
                  <td className={`px-3 py-1.5 ${t.netPnl < 0 ? "text-loss" : "text-gain"}`}>{signedRupees(t.netPnl)}</td>
                  <td className="px-3 py-1.5">{t.hadStopLoss ? "Yes" : "No"}</td>
                  <td className="px-3 py-1.5">{t.moneyness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
