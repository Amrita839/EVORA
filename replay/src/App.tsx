import { Link, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import { useStore } from "./state";
import Debug from "./pages/Debug";
import Evals from "./pages/Evals";
import Home from "./pages/Home";
import Results from "./pages/Results";

/** The hosted artifact build follows the viewer's theme instead of having its own switch. */
const EMBEDDED = import.meta.env.VITE_ARTIFACT === "1";

export default function App() {
  const { dark, toggleTheme } = useStore();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-accent text-sm text-bg">↺</span>
          Replay
        </Link>
        {!EMBEDDED && (
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:text-ink"
        >
          {dark ? "Light" : "Dark"}
        </button>
        )}
      </header>
      <main className="flex-1 pb-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/evals" element={<Evals />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
