"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/client";

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      toast.error("Please confirm you'd like to receive updates first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsappOptIn: consent }),
      });
      if (!res.ok) throw new Error();
      trackEvent("NEWSLETTER_SIGNUP");
      toast.success("You're subscribed — thank you!");
      setEmail("");
      setConsent(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(isDark && "bg-forest-900 border-ivory-100/20 text-ivory-50 placeholder:text-ivory-100/40")}
        />
        <Button type="submit" variant="accent" disabled={submitting}>
          Join
        </Button>
      </div>
      <label className={cn("flex items-start gap-2 text-xs", isDark ? "text-ivory-100/70" : "text-muted-foreground")}>
        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        Send me product updates and enquiry follow-ups on WhatsApp and email.
      </label>
    </form>
  );
}
