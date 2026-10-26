import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorList } from "../components/FileNotes";
import { downloadText } from "../lib/format";
import { CSV_TEMPLATE } from "../lib/parse";
import { analyze, type Analysis } from "../lib/pipeline";
import { SAMPLE_SPECS, buildSample } from "../lib/samples";
import { useStore } from "../state";

export default function Home() {
  const { setAnalysis } = useStore();
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<{ title: string; analysis: Analysis } | null>(null);

  const open = (a: Analysis) => {
    if (a.parse.fatal || a.trades.length === 0) {
      setProblem({
        title: a.parse.fatal ?? "We could not find any finished trades in this file.",
        analysis: a,
      });
      return;
    }
    setProblem(null);
    setAnalysis(a);
    nav("/results");
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    open(analyze(text, f.name.replace(/\.csv$/i, "")));
    if (input.current) input.current.value = "";
  };

  return (
    <div>
      <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Your month in trading, in 3 habits.</h1>
      <p className="mt-3 text-muted">
        Upload one month of F&O orders. We find the habits that cost you the most, in rupees, using your own trades.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => input.current?.click()}
          className="rounded-full bg-accent px-5 py-2.5 font-medium text-bg hover:opacity-90"
        >
          Upload CSV
        </button>
        <button
          onClick={() => downloadText("replay-template.csv", CSV_TEMPLATE)}
          className="rounded-full border border-line bg-surface px-5 py-2.5 font-medium hover:bg-sunken"
        >
          Download CSV template
        </button>
        <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Choose a CSV file" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <p className="mt-3 text-xs text-muted">Your file stays in your browser.</p>

      {problem && (
        <div role="alert" className="mt-5 rounded-xl border border-loss/40 bg-surface px-4 py-3 text-sm">
          <p className="font-medium text-loss">{problem.title}</p>
          {problem.analysis.errors.length > 0 && !problem.analysis.parse.fatal && <ErrorList errors={problem.analysis.errors} open />}
        </div>
      )}

      <h2 className="mt-10 text-sm font-medium text-muted">Or try a sample trader</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {SAMPLE_SPECS.map((s) => (
          <li key={s.key}>
            <button
              onClick={() => open(analyze(buildSample(s.key).csv, s.name))}
              className="h-full w-full rounded-2xl border border-line bg-surface px-4 py-3 text-left transition hover:border-accent"
            >
              <span className="block font-semibold">{s.name}</span>
              <span className="mt-0.5 block text-sm text-muted">{s.blurb}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
