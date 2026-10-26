import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Analysis } from "./lib/pipeline";
import { aiConfigured } from "./lib/wording";

interface Store {
  analysis: Analysis | null;
  setAnalysis: (a: Analysis | null) => void;
  aiOn: boolean;
  setAiOn: (v: boolean) => void;
  /** AI is on and a backend exists. Otherwise templates are used. */
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
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const setAiOn = useCallback((v: boolean) => {
    setAiOnState(v);
    write("replay.ai", v ? "on" : "off");
  }, []);
  const toggleTheme = useCallback(() => setDark((d) => !d), []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    write("replay.theme", dark ? "dark" : "light");
  }, [dark]);

  const value = useMemo(
    () => ({ analysis, setAnalysis, aiOn, setAiOn, aiActive: aiOn && aiConfigured, dark, toggleTheme }),
    [analysis, aiOn, setAiOn, dark, toggleTheme],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}
