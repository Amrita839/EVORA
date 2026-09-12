"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiWidget } from "@/hooks/use-ai-widget";

export function AiTeaser() {
  const open = useAiWidget((s) => s.open);

  return (
    <section className="container-evora py-20">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-champagne-300 bg-gradient-to-br from-champagne-100 to-ivory-50 px-8 py-16 text-center">
        <Sparkles className="size-8 text-champagne-600" />
        <h2 className="max-w-xl text-balance font-serif text-3xl text-forest-950 sm:text-4xl">
          Not sure what to gift?
        </h2>
        <p className="max-w-md text-muted-foreground">
          Tell Evora what you&apos;re looking for — the occasion, the recipient, or your budget — and get real
          recommendations from our catalog.
        </p>
        <Button size="lg" variant="default" onClick={() => open()}>
          <Sparkles /> Ask Evora
        </Button>
      </div>
    </section>
  );
}
