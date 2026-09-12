"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiWidget } from "@/hooks/use-ai-widget";
import { getOrCreateSessionId } from "@/lib/utils";
import { ProductRecommendationCard } from "@/components/ai/product-recommendation-card";
import type { ProductCardData } from "@/types";

type ChatEntry =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; products?: ProductCardData[] };

const QUICK_PROMPTS = [
  "Find a corporate gift",
  "Gift under ₹1000",
  "Gift for employees",
  "Show premium gifts",
  "I need 50 gifts",
];

const GREETING: ChatEntry = {
  role: "assistant",
  content:
    "Hi, I'm Evora — your personal gifting assistant. Tell me who you're gifting, the occasion, or your budget, and I'll find the right fit.",
};

export function AiAssistantWidget() {
  const { isOpen, open, close, prefill, clearPrefill } = useAiWidget();
  const [entries, setEntries] = useState<ChatEntry[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefill) {
      // Syncs local input state from the shared widget store's prefill request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(prefill);
      clearPrefill();
    }
  }, [prefill, clearPrefill]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, loading]);

  async function sendMessage(message: string) {
    if (!message.trim() || loading) return;
    setEntries((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const history = entries.slice(-6).map((e) => ({ role: e.role, content: e.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: getOrCreateSessionId(), history }),
      });
      const data = await res.json();
      setEntries((prev) => [...prev, { role: "assistant", content: data.message, products: data.products }]);
    } catch {
      setEntries((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. You can browse our collections or contact us on WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => open()}
            aria-label="Ask Evora — AI gifting assistant"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-forest-900 px-5 py-3.5 text-ivory-50 shadow-lg"
          >
            <Sparkles className="size-5 text-champagne-500" />
            <span className="text-sm font-medium">Ask Evora</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden border-border bg-card shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-3xl sm:border"
          >
            <div className="flex items-center justify-between bg-forest-900 px-5 py-4 text-ivory-50">
              <div>
                <p className="flex items-center gap-1.5 font-serif text-lg">
                  <Sparkles className="size-4 text-champagne-500" /> Ask Evora
                </p>
                <p className="text-xs text-ivory-100/70">Your personal gifting assistant</p>
              </div>
              <Button variant="ghost" size="icon" className="text-ivory-50 hover:bg-ivory-50/10" onClick={close}>
                <X />
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {entries.map((entry, i) => (
                  <div key={i} className={entry.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[92%]"}>
                    <div
                      className={
                        entry.role === "user"
                          ? "rounded-2xl rounded-br-sm bg-forest-800 px-4 py-2.5 text-sm text-ivory-50"
                          : "rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-foreground"
                      }
                    >
                      {entry.content}
                    </div>
                    {entry.role === "assistant" && entry.products && entry.products.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        {entry.products.map((p) => (
                          <ProductRecommendationCard key={p.id} product={p} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" /> Evora is thinking…
                  </div>
                )}
              </div>
            </div>

            {entries.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-charcoal-800 transition-colors hover:bg-muted"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a gift, occasion, or budget…"
                className="h-11"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
