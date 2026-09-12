"use client";

import { useState, cloneElement, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader, type ImageEntry } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/utils";
import type { Category, Occasion, Recipient } from "@prisma/client";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  sku: string;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  pricingMode: "BUYABLE" | "ENQUIRY_ONLY" | "BOTH";
  tags: string;
  material: string;
  color: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  customizationAvailable: boolean;
  minimumOrderQuantity: string;
  corporateAvailable: boolean;
  images: ImageEntry[];
  occasionIds: string[];
  recipientIds: string[];
};

const EMPTY_FORM: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  sku: "",
  stockStatus: "IN_STOCK",
  pricingMode: "BOTH",
  tags: "",
  material: "",
  color: "",
  isFeatured: false,
  isBestSeller: false,
  isNew: false,
  isActive: true,
  customizationAvailable: false,
  minimumOrderQuantity: "1",
  corporateAvailable: false,
  images: [],
  occasionIds: [],
  recipientIds: [],
};

export function ProductForm({
  initial,
  categories,
  occasions,
  recipients,
}: {
  initial?: ProductFormValues;
  categories: Category[];
  occasions: Occasion[];
  recipients: Recipient[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(initial ?? EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      shortDescription: form.shortDescription || undefined,
      price: form.price ? Number(form.price) : null,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      categoryId: form.categoryId || null,
      sku: form.sku || undefined,
      stockStatus: form.stockStatus,
      pricingMode: form.pricingMode,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      material: form.material || undefined,
      color: form.color || undefined,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      isNew: form.isNew,
      isActive: form.isActive,
      customizationAvailable: form.customizationAvailable,
      minimumOrderQuantity: Number(form.minimumOrderQuantity) || 1,
      corporateAvailable: form.corporateAvailable,
      images: form.images,
      occasionIds: form.occasionIds,
      recipientIds: form.recipientIds,
    };

    try {
      const res = await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      toast.success(form.id ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16">
      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input
              required
              value={form.name}
              onChange={(e) => {
                update("name", e.target.value);
                if (!slugTouched) update("slug", slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug">
            <Input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
            />
          </Field>
        </div>
        <Field label="Short Description">
          <Input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} maxLength={200} />
        </Field>
        <Field label="Description">
          <Textarea required rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </Field>
      </Section>

      <Section title="Images">
        <ImageUploader images={form.images} onChange={(images) => update("images", images)} />
      </Section>

      <Section title="Pricing & Availability">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (₹)">
            <Input type="number" min={0} value={form.price} onChange={(e) => update("price", e.target.value)} />
          </Field>
          <Field label="Compare-at Price (₹)">
            <Input type="number" min={0} value={form.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} />
          </Field>
          <Field label="Minimum Order Quantity">
            <Input type="number" min={1} value={form.minimumOrderQuantity} onChange={(e) => update("minimumOrderQuantity", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purchase Mode">
            <Select value={form.pricingMode} onValueChange={(v) => update("pricingMode", v as ProductFormValues["pricingMode"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYABLE">Buyable</SelectItem>
                <SelectItem value="ENQUIRY_ONLY">Enquiry Only</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Stock Status">
            <Select value={form.stockStatus} onValueChange={(v) => update("stockStatus", v as ProductFormValues["stockStatus"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="PREORDER">Preorder</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Organization">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={form.categoryId} onValueChange={(v) => update("categoryId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="SKU">
            <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Material">
            <Input value={form.material} onChange={(e) => update("material", e.target.value)} />
          </Field>
          <Field label="Color">
            <Input value={form.color} onChange={(e) => update("color", e.target.value)} />
          </Field>
        </div>
        <Field label="Tags (comma-separated)">
          <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="premium, desk, corporate" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <MultiCheck
            label="Occasions"
            options={occasions.map((o) => ({ id: o.id, label: o.name }))}
            selected={form.occasionIds}
            onChange={(v) => update("occasionIds", v)}
          />
          <MultiCheck
            label="Recipients"
            options={recipients.map((r) => ({ id: r.id, label: r.name }))}
            selected={form.recipientIds}
            onChange={(v) => update("recipientIds", v)}
          />
        </div>
      </Section>

      <Section title="Flags">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FlagCheck label="Featured" checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} />
          <FlagCheck label="Best Seller" checked={form.isBestSeller} onChange={(v) => update("isBestSeller", v)} />
          <FlagCheck label="New" checked={form.isNew} onChange={(v) => update("isNew", v)} />
          <FlagCheck label="Active" checked={form.isActive} onChange={(v) => update("isActive", v)} />
          <FlagCheck
            label="Customization Available"
            checked={form.customizationAvailable}
            onChange={(v) => update("customizationAvailable", v)}
          />
          <FlagCheck label="Corporate Available" checked={form.corporateAvailable} onChange={(v) => update("corporateAvailable", v)} />
        </div>
      </Section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Saving…" : form.id ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
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
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id })}
    </div>
  );
}

function FlagCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-charcoal-800">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {label}
    </label>
  );
}

function MultiCheck({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(active ? selected.filter((id) => id !== opt.id) : [...selected, opt.id])}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active ? "border-forest-800 bg-forest-800 text-ivory-50" : "border-border text-charcoal-800 hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
