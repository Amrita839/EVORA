"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics/client";

const initialState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  quantity: "",
  budgetPerGift: "",
  occasion: "",
  deliveryTimeline: "",
  message: "",
};

export function CorporateQuoteForm() {
  const [form, setForm] = useState(initialState);
  const [customizationRequired, setCustomizationRequired] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          budgetPerGift: form.budgetPerGift ? Number(form.budgetPerGift) : undefined,
          customizationRequired,
          whatsappOptIn,
        }),
      });
      if (!res.ok) throw new Error();
      trackEvent("CORPORATE_QUOTE");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or reach us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-forest-700" />
        <h3 className="font-serif text-2xl text-forest-950">Request received</h3>
        <p className="max-w-sm text-muted-foreground">
          Thank you — our corporate gifting team will reach out with a tailored quote shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your Name" htmlFor="name">
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Company" htmlFor="company">
          <Input id="company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Quantity" htmlFor="quantity">
          <Input id="quantity" type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        </Field>
        <Field label="Budget per gift (₹)" htmlFor="budget">
          <Input id="budget" type="number" min={0} value={form.budgetPerGift} onChange={(e) => setForm({ ...form, budgetPerGift: e.target.value })} />
        </Field>
        <Field label="Delivery timeline" htmlFor="timeline">
          <Input id="timeline" placeholder="e.g. 3 weeks" value={form.deliveryTimeline} onChange={(e) => setForm({ ...form, deliveryTimeline: e.target.value })} />
        </Field>
      </div>

      <Field label="Occasion" htmlFor="occasion">
        <Select value={form.occasion} onValueChange={(v) => setForm({ ...form, occasion: v })}>
          <SelectTrigger id="occasion">
            <SelectValue placeholder="Select an occasion" />
          </SelectTrigger>
          <SelectContent>
            {["Employee Onboarding", "Festive", "Client Appreciation", "Anniversary", "Other"].map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Tell us more (optional)" htmlFor="message">
        <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </Field>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <Checkbox checked={customizationRequired} onCheckedChange={(v) => setCustomizationRequired(v === true)} className="mt-0.5" />
        I&apos;d like branding or customization on these gifts
      </label>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <Checkbox checked={whatsappOptIn} onCheckedChange={(v) => setWhatsappOptIn(v === true)} className="mt-0.5" />
        Send me updates and follow-ups on WhatsApp
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Submitting…" : "Request a Corporate Quote"}
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
