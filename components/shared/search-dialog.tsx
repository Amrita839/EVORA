"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/client";
import type { ProductCardData } from "@/types";

const SUGGESTIONS = [
  "Gift for employees",
  "Corporate gifts under ₹2000",
  "Diwali gifts",
  "Gift for clients",
  "Personalized gifts",
];

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // Resets search state when the dialog closes, so it opens fresh next time.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      // Clears stale results once the query is too short to search on.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
        trackEvent("SEARCH", { query });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0" showClose={false}>
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search Evora Gifting</DialogTitle>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gifts, occasions, recipients…"
              className="h-12 border-none pl-11 shadow-none focus-visible:ring-0"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto border-t border-border p-4">
          {query.trim().length < 2 ? (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-charcoal-800 transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : results.length === 0 && !loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products found for &ldquo;{query}&rdquo;. Try a different term, or ask our AI assistant.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-beige-100">
                      {product.images[0] && (
                        <Image src={product.images[0].url} alt={product.name} fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-forest-900">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-forest-800">
                      {product.pricingMode === "ENQUIRY_ONLY" ? "Enquire" : formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
