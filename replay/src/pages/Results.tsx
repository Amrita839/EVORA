import { Link, Navigate } from "react-router-dom";
import FileNotes from "../components/FileNotes";
import HabitCard from "../components/HabitCard";
import SummaryStrip from "../components/SummaryStrip";
import { useWording } from "../lib/useWording";
import { useStore } from "../state";

export default function Results() {
  const { analysis, aiActive } = useStore();
  const { wordingFor, pending } = useWording(analysis?.top ?? [], aiActive);
  if (!analysis) return <Navigate to="/" replace />;
  const a = analysis;
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-base font-medium text-muted">
          {a.name} <span aria-hidden>·</span> September 2026
        </h1>
        <Link to="/" className="text-sm text-muted underline-offset-2 hover:underline">
          Start over
        </Link>
      </div>

      <SummaryStrip s={a.summary} />
      <FileNotes a={a} />

      {a.top.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-line bg-surface px-5 py-8 text-center">
          <p className="text-3xl" aria-hidden>🌿</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">No costly habits found this month</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            We checked six common habits. None cost you ₹500 or more across at least 3 trades. Keep doing what you are doing.
          </p>
        </section>
      ) : (
        <>
          <h2 className="mb-3 mt-6 text-sm font-medium text-muted">
            {a.top.length === 1 ? "The habit that cost you most" : `The ${a.top.length} habits that cost you most`}
          </h2>
          <div className="space-y-4">
            {a.top.map((h, i) => (
              <HabitCard key={h.id} rank={i + 1} habit={h} trades={a.trades} wording={wordingFor(h)} polishing={pending} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            A trade can show up in more than one habit, so these costs can overlap and don't add up to your total loss.
          </p>
        </>
      )}
    </div>
  );
}
