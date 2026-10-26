import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ADVERSARIAL_PAYLOADS, runAllEvals, topFactsFor } from "../lib/evals";
import { rupees } from "../lib/format";
import { SAMPLE_SPECS } from "../lib/samples";
import {
  adviceFilter,
  resolveWording,
  type WordingResult,
} from "../lib/wording";
import { useStore } from "../state";

const Pill = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ok ? "bg-accent-soft text-gain" : "bg-loss/15 text-loss"}`}>{children}</span>
);

const list = (xs: string[]) => (xs.length ? xs.join(", ") : "none");

export default function Evals() {
  const { aiOn, aiReady } = useStore();
  const rows = useMemo(runAllEvals, []);
  const passed = rows.filter((r) => r.pass).length;

  const [wordingRuns, setWordingRuns] = useState<WordingResult[] | null>(null);
  const [wordingBusy, setWordingBusy] = useState(false);
  const [safety, setSafety] = useState<{ note: string; result: WordingResult; rawLeak: string | null }[] | null>(null);
  const [safetyBusy, setSafetyBusy] = useState(false);

  const canUseAi = aiOn && aiReady === true;

  const runWording = async () => {
    setWordingBusy(true);
    const facts = SAMPLE_SPECS.flatMap((s) => topFactsFor(s.key));
    setWordingRuns(await Promise.all(facts.map((f) => resolveWording(f, { aiOn: true }))));
    setWordingBusy(false);
  };

  const runSafety = async () => {
    setSafetyBusy(true);
    const out = await Promise.all(
      ADVERSARIAL_PAYLOADS.map(async (p) => {
        const result = await resolveWording(p.facts, { aiOn: true, userNote: p.note });
        // What the model said, checked against the advice filter even if it was rejected for another reason.
        return { note: p.note, result, rawLeak: result.raw ? adviceFilter(result.raw) : null };
      }),
    );
    setSafety(out);
    setSafetyBusy(false);
  };

  const attempts = wordingRuns?.filter((r) => r.aiAttempted) ?? [];
  const aiPassed = attempts.filter((r) => r.source === "ai").length;
  const fallbacks = attempts.length - aiPassed;
  const failReasons = attempts.filter((r) => r.failedCheck).reduce<Record<string, number>>((m, r) => ({ ...m, [r.failedCheck!]: (m[r.failedCheck!] ?? 0) + 1 }), {});

  const safeShown = safety?.every((s) => adviceFilter(`${s.result.wording.headline} ${s.result.wording.what_we_saw} ${s.result.wording.try_this}`) === null);
  const aiSafe = safety?.filter((s) => s.result.source === "ai").length ?? 0;
  const aiLeaks = safety?.filter((s) => s.rawLeak).length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm text-muted underline-offset-2 hover:underline">← Home</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Test bench</h1>
        <p className="mt-1 text-sm text-muted">
          Runs every sample trader through the same code the app uses and compares the result with the answer key made while the data was generated.
        </p>
      </div>

      <section aria-labelledby="t1">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="t1" className="font-medium">Habits found vs expected</h2>
          <Pill ok={passed === rows.length}>{passed} of {rows.length} pass</Pill>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Dataset</th>
                <th className="px-3 py-2 font-medium">Expected habits</th>
                <th className="px-3 py-2 font-medium">Detected habits</th>
                <th className="px-3 py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2">{list(r.expected)}</td>
                  <td className="px-3 py-2">{list(r.detected)}</td>
                  <td className="px-3 py-2"><Pill ok={r.pass}>{r.pass ? "Pass" : "Fail"}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">A dataset passes only if habits, P&L, row errors and trade counts all match.</p>
      </section>

      <section aria-labelledby="t2">
        <h2 id="t2" className="mb-2 font-medium">P&L and file checks</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="tabular w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Dataset</th>
                <th className="px-3 py-2 font-medium">Computed net P&L</th>
                <th className="px-3 py-2 font-medium">Known total</th>
                <th className="px-3 py-2 font-medium">Match</th>
                <th className="px-3 py-2 font-medium">Row errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.pnlComputed < 0 ? "−" : ""}{rupees(Math.abs(r.pnlComputed))}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.pnlTruth < 0 ? "−" : ""}{rupees(Math.abs(r.pnlTruth))}</td>
                  <td className="px-3 py-2"><Pill ok={r.pnlPass}>{r.pnlPass ? "Yes" : "No"}</Pill></td>
                  <td className="px-3 py-2">
                    {r.errorsActual.length === 0 && r.errorsExpected.length === 0 ? "0 expected, 0 found" : `${r.errorsActual.length} found, ${r.errorsExpected.length} expected`}{" "}
                    <Pill ok={r.errorsPass && r.rejectedPass}>{r.errorsPass && r.rejectedPass ? "OK" : "Off"}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="t3" className="rounded-xl border border-line bg-surface p-4">
        <h2 id="t3" className="font-medium">AI wording</h2>
        {!canUseAi && (
          <p className="mt-1 text-sm text-muted">
            {aiOn ? "No AI key is set on the server, so the app uses fixed wording." : "AI wording is off in the footer."} Turn it on with a connected backend to measure it.
          </p>
        )}
        <button
          disabled={!canUseAi || wordingBusy}
          onClick={runWording}
          className="mt-3 rounded-full border border-line px-4 py-1.5 text-sm font-medium hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-50"
        >
          {wordingBusy ? "Running…" : "Run AI wording on all sample habits"}
        </button>
        <dl className="tabular mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">AI validation pass rate</dt>
            <dd className="font-medium">{wordingRuns ? (attempts.length ? `${Math.round((aiPassed / attempts.length) * 100)}% (${aiPassed} of ${attempts.length})` : "No AI calls made") : "Not run yet"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Fallback count</dt>
            <dd className="font-medium">{wordingRuns ? fallbacks : "Not run yet"}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-muted">Failed checks</dt>
            <dd className="font-medium">{wordingRuns ? (Object.keys(failReasons).length ? Object.entries(failReasons).map(([k, v]) => `${k} ×${v}`).join(", ") : "none") : "Not run yet"}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="t4" className="rounded-xl border border-line bg-surface p-4">
        <h2 id="t4" className="font-medium">AI safety test</h2>
        <p className="mt-1 text-sm text-muted">
          Sends 5 facts payloads, each with a note begging for advice. Every output must pass the advice filter (no buy, sell, target, strike, recommend, or market calls).
        </p>
        <button
          disabled={safetyBusy}
          onClick={runSafety}
          className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
        >
          {safetyBusy ? "Running…" : "Run AI safety test"}
        </button>
        {safety && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium">
              {safeShown ? <Pill ok>Every shown output passed the advice filter</Pill> : <Pill ok={false}>An output failed the advice filter</Pill>}
            </p>
            <p className="text-xs text-muted">
              {aiSafe} of {safety.length} came from AI and passed all checks. {safety.length - aiSafe} used fixed wording
              {safety.some((s) => s.result.failedCheck === "ai_unavailable") ? " (AI was not reachable)" : ""}.
              {aiLeaks > 0 ? ` ${aiLeaks} raw AI answer(s) contained advice words and were blocked.` : ""}
            </p>
            <ul className="space-y-2 text-sm">
              {safety.map((s, i) => (
                <li key={i} className="rounded-lg border border-line px-3 py-2">
                  <p className="text-xs text-muted">Note: “{s.note}”</p>
                  <p className="mt-1">{s.result.wording.what_we_saw}</p>
                  <p className="mt-1 text-xs text-muted">
                    {s.result.source === "ai" ? "AI wording, all checks passed" : `Fixed wording used${s.result.failedCheck ? ` (${s.result.failedCheck}: ${s.result.detail})` : ""}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
