import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Analysis } from "./lib/pipeline";
import { probeAi } from "./lib/wording";

interface Store {
  analysis: Analysis | null;
  setAnalysis: (a: Analysis | null) => void;
  aiOn: boolean;
  setAiOn: (v: boolean) => void;
  /** The server has an API key. null while checking. */
  aiReady: boolean | null;
  /** AI is on and the server is ready. Otherwise templates are used. */
  aiActive: boolean;
  dark: boolean;
  toggleTheme: () => void;
}

const Ctx = createContext<Store | null>(null);

const read = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode: ignore */
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiOn, setAiOnState] = useState(() => read("replay.ai") !== "off");
  const [dark, setDark] = useState(() => {
    const t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [aiReady, setAiReady] = useState<boolean | null>(null);
  useEffect(() => {
    probeAi().then(setAiReady);
  }, []);

  const setAiOn = useCallback((v: boolean) => {
    setAiOnState(v);
    write("replay.ai", v ? "on" : "off");
  }, []);
  const toggleTheme = useCallback(() => {
    setDark((d) => {
      document.documentElement.setAttribute("data-theme", d ? "light" : "dark");
      write("replay.theme", d ? "light" : "dark");
      return !d;
    });
  }, []);

  const value = useMemo(
    () => ({ analysis, setAnalysis, aiOn, setAiOn, aiReady, aiActive: aiOn && aiReady === true, dark, toggleTheme }),
    [analysis, aiOn, setAiOn, aiReady, dark, toggleTheme],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}
