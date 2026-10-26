import { Link } from "react-router-dom";
import { aiConfigured } from "../lib/wording";
import { useStore } from "../state";

export default function Footer() {
  const { aiOn, setAiOn } = useStore();
  return (
    <footer className="border-t border-line py-5 text-xs text-muted">
      <p>Educational review of your past trades. Not investment advice.</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          role="switch"
          aria-checked={aiOn}
          onClick={() => setAiOn(!aiOn)}
          className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 hover:text-ink"
        >
          <span aria-hidden className={`size-2 rounded-full ${aiOn ? "bg-accent" : "bg-muted/50"}`} />
          AI wording: {aiOn ? "on" : "off"}
        </button>
        {aiOn && !aiConfigured && <span>AI is not connected, so fixed wording is used.</span>}
        <Link to="/evals" className="underline-offset-2 hover:underline">
          Test bench
        </Link>
      </div>
    </footer>
  );
}
