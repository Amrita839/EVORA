"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

type EnquiryCartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeLine: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
};

/**
 * The "Enquiry Basket" — this is deliberately not a checkout cart. It holds
 * products + quantities a visitor wants to ask about, then hands off to
 * WhatsApp or the enquiry form. Persisted to localStorage so it survives a
 * page reload.
 */
export const useEnquiryCart = create<EnquiryCartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        }),
      removeLine: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId ? { ...l, quantity: Math.max(1, quantity) } : l
          ),
        })),
      clear: () => set({ lines: [] }),
      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "evora-enquiry-basket" }
  )
);
