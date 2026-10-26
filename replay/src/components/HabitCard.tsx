import { HABIT_INFO } from "../lib/habits";
import { describeContract } from "../lib/matchTrades";
import { holdText, rupees, shortDate, signedRupees } from "../lib/format";
import type { WordingResult } from "../lib/wording";
import type { Habit, Trade } from "../lib/types";

interface Props {
  rank: number;
  habit: Habit;
  trades: Trade[];
  wording: WordingResult;
  polishing: boolean;
}

function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex cursor-pointer items-center gap-2 py-3 text-sm font-medium text-muted hover:text-ink">
        <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
        {title}
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

export default function HabitCard({ rank, habit, trades, wording, polishing }: Props) {
  const ids = new Set(habit.affected_trade_ids);
  const affected = trades.filter((t) => ids.has(t.id));
  const info = HABIT_INFO[habit.id];
  const w = wording.wording;
  return (
    <article className="rounded-2xl border border-line bg-surface px-5 pt-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-label={`Habit number ${rank}`}>
          {rank}
        </span>
        {habit.confidence === "Low" && (
          <span
            title="Based on fewer than 5 trades. Treat it as a hint, not a rule."
            className="rounded-full border border-line bg-sunken px-2.5 py-0.5 text-xs text-muted"
          >
            Low confidence · {habit.affected_trade_ids.length} trades
          </span>
        )}
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-tight">{w.headline}</h2>
      <p className="tabular mt-2 text-4xl font-semibold tracking-tight text-loss">{rupees(habit.cost_rupees)}</p>
      <p className="text-sm text-muted">{info.costLabel}</p>
      <p className="mt-4 leading-relaxed">{w.what_we_saw}</p>
      <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Try this next month</p>
        <p className="mt-1">{w.try_this}</p>
      </div>
      <p className="mt-3 text-xs text-muted" aria-live="polite">
        {polishing ? "Polishing the wording…" : wording.source === "ai" ? "Wording by AI. Numbers are ours." : "Standard wording."}
      </p>

      <div className="mt-3">
        <Disclosure title={`See the trades (${affected.length})`}>
          <ul className="max-h-80 divide-y divide-line overflow-auto rounded-lg border border-line text-sm">
            {affected.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate">
                    {shortDate(t.entryDate)} · {describeContract(t)}
                  </p>
                  <p className="text-xs text-muted">Held {holdText(t.holdMinutes)}</p>
                </div>
                <p className={`tabular shrink-0 font-medium ${t.netPnl < 0 ? "text-loss" : "text-gain"}`}>{signedRupees(t.netPnl)}</p>
              </li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure title="How we calculated this">
          <p className="text-sm text-muted">{info.rule}</p>
        </Disclosure>
      </div>
    </article>
  );
}
