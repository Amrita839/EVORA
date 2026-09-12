"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { useEnquiryCart } from "@/hooks/use-enquiry-cart";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { getOrCreateSessionId } from "@/lib/utils";
import { buildEnquiryMessage } from "@/lib/whatsapp/links";
import { trackEvent } from "@/lib/analytics/client";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default function EnquiryPage() {
  const { lines, clear } = useEnquiryCart();
  const mounted = useHasMounted();
  const cartLines = mounted ? lines : [];
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", message: "" });
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: "GENERAL",
          source: "WEBSITE",
          whatsappOptIn,
          sessionId: getOrCreateSessionId(),
          items: lines.map((l) => ({ productId: l.productId, name: l.name, quantity: l.quantity })),
        }),
      });
      if (!res.ok) throw new Error();
      trackEvent("ENQUIRY_SUBMITTED");
      setSubmitted(true);
      clear();
    } catch {
      setError("Something went wrong submitting your enquiry. Please try WhatsApp instead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container-evora flex flex-col items-center gap-4 py-24 text-center">
        <CheckCircle2 className="size-12 text-forest-700" />
        <h1 className="font-serif text-3xl text-forest-950">Enquiry received</h1>
        <p className="max-w-md text-muted-foreground">
          Thank you, {form.name || "there"} — our team will reach out shortly with pricing and availability.
        </p>
        <Button asChild>
          <Link href="/products">Continue Browsing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-evora py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 font-serif text-4xl text-forest-950">Send an Enquiry</h1>
        <p className="mb-8 text-muted-foreground">
          {mounted && lines.length > 0
            ? `${lines.length} item(s) in your basket — our team will follow up with details.`
            : "Tell us what you're looking for and we'll get back to you."}
        </p>

        {mounted && lines.length > 0 && (
          <ul className="mb-8 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between">
                <span>{l.name}</span>
                <span className="text-muted-foreground">×{l.quantity}</span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox checked={whatsappOptIn} onCheckedChange={(v) => setWhatsappOptIn(v === true)} className="mt-0.5" />
            Send me product updates and enquiry follow-ups on WhatsApp.
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Sending…" : "Send Enquiry"}
          </Button>

          {WHATSAPP_NUMBER && (
            <WhatsAppButton
              size="lg"
              variant="outline"
              phoneNumber={WHATSAPP_NUMBER}
              source="enquiry_page"
              message={buildEnquiryMessage({ items: cartLines.map((l) => ({ name: l.name, quantity: l.quantity })), customerName: form.name })}
              label="Or send via WhatsApp instead"
            />
          )}
        </form>
      </div>
    </div>
  );
}
