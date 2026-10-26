import type { Analysis } from "../lib/pipeline";
import { plural } from "../lib/format";

/** One quiet line about what was read, skipped or left out. Row errors sit behind an expander. */
export default function FileNotes({ a }: { a: Analysis }) {
  const bits: string[] = [];
  // A rejected order never traded, so it is skipped too. Say which kind each skipped row was.
  const skipped = a.errors.length + a.parse.rejectedIgnored;
  if (skipped) {
    const why = [a.errors.length && `${a.errors.length} with errors`, a.parse.rejectedIgnored && `${plural(a.parse.rejectedIgnored, "rejected order")}`].filter(Boolean);
    bits.push(`${plural(skipped, "row")} skipped (${why.join(", ")})`);
  }
  if (a.parse.cancelledIgnored) bits.push(`${plural(a.parse.cancelledIgnored, "cancelled order")} ignored`);
  if (a.openPositions) bits.push(`${plural(a.openPositions, "open position")} not counted`);
  if (bits.length === 0) return null;
  return (
    <div className="mt-2 text-xs text-muted">
      <p>{bits.join(" · ")}</p>
      {a.errors.length > 0 && <ErrorList errors={a.errors} />}
    </div>
  );
}

export function ErrorList({ errors, open = false }: { errors: Analysis["errors"]; open?: boolean }) {
  return (
    <details open={open} className="group mt-1">
      <summary className="inline-flex cursor-pointer items-center gap-1 underline-offset-2 hover:underline">
        <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
        See the skipped rows
      </summary>
      <ul className="mt-1 space-y-1 border-l border-line pl-3">
        {errors.map((e, i) => (
          <li key={i}>{e.message}</li>
        ))}
      </ul>
    </details>
  );
}
