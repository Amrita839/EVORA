"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-ivory-50 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-beige-100 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="font-serif text-4xl text-forest-950">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        We hit an unexpected error. Please try again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
