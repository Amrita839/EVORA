"use client";

import { useState, cloneElement, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { SiteSettings } from "@prisma/client";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: settings.companyName,
    tagline: settings.tagline ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    whatsappNumber: settings.whatsappNumber ?? "",
    address: settings.address ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    linkedinUrl: settings.linkedinUrl ?? "",
    facebookUrl: settings.facebookUrl ?? "",
    footerText: settings.footerText ?? "",
    businessHours: settings.businessHours ?? "",
    whatsappEnabled: settings.whatsappEnabled,
    corporateInfo: settings.corporateInfo ?? "",
    customGiftingInfo: settings.customGiftingInfo ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-8 pb-16">
      <Section title="Company">
        <Field label="Company Name">
          <Input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </Field>
        <Field label="Tagline">
          <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </Field>
        <Field label="Footer Text">
          <Textarea value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} />
        </Field>
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <Field label="Business Hours">
          <Input value={form.businessHours} onChange={(e) => setForm({ ...form, businessHours: e.target.value })} placeholder="Mon–Sat, 10am–7pm" />
        </Field>
      </Section>

      <Section title="WhatsApp">
        <Field label="WhatsApp Number (international format, no + or spaces)">
          <Input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="911234567890" />
        </Field>
        <label className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-forest-900">Enable WhatsApp Business notifications</p>
            <p className="text-xs text-muted-foreground">Requires Cloud API credentials in your environment variables.</p>
          </div>
          <Switch checked={form.whatsappEnabled} onCheckedChange={(v) => setForm({ ...form, whatsappEnabled: v })} />
        </label>
      </Section>

      <Section title="Social Links">
        <Field label="Instagram URL">
          <Input value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} />
        </Field>
        <Field label="LinkedIn URL">
          <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
        </Field>
        <Field label="Facebook URL">
          <Input value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} />
        </Field>
      </Section>

      <Section title="Page Content">
        <Field label="Corporate Gifting Info">
          <Textarea rows={4} value={form.corporateInfo} onChange={(e) => setForm({ ...form, corporateInfo: e.target.value })} />
        </Field>
        <Field label="Custom Gifting Info">
          <Textarea rows={4} value={form.customGiftingInfo} onChange={(e) => setForm({ ...form, customGiftingInfo: e.target.value })} />
        </Field>
      </Section>

      <Button type="submit" size="lg" className="w-fit" disabled={submitting}>
        {submitting ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg text-forest-950">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactElement<{ id?: string }> }) {
  const id = `setting-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id })}
    </div>
  );
}
