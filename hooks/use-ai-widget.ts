"use client";

import { create } from "zustand";

type AiWidgetState = {
  isOpen: boolean;
  prefill: string | null;
  open: (prefill?: string) => void;
  close: () => void;
  toggle: () => void;
  clearPrefill: () => void;
};

/** Shared open/close state so the navbar icon and floating button control the same widget. */
export const useAiWidget = create<AiWidgetState>((set) => ({
  isOpen: false,
  prefill: null,
  open: (prefill) => set({ isOpen: true, prefill: prefill ?? null }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  clearPrefill: () => set({ prefill: null }),
}));
