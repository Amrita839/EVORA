"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { shopByOccasion } from "@/lib/site-config";
import type { Category } from "@prisma/client";

const PRICE_BUCKETS = [
  { label: "Under ₹1,000", min: undefined, max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 – ₹3,500", min: 2000, max: 3500 },
  { label: "Above ₹3,500", min: 3500, max: undefined },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined) {
      params.delete(key);
    } else if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleBoolean(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === "true") {
      params.delete(key);
    } else {
      params.set(key, "true");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const activeCategory = searchParams.get("category");
  const activeOccasion = searchParams.get("occasion");
  const activeMin = searchParams.get("minPrice");
  const activeMax = searchParams.get("maxPrice");

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-forest-950">Filters</h3>
        {hasFilters && (
          <Button variant="link" size="sm" onClick={() => router.push(pathname)}>
            Clear all
          </Button>
        )}
      </div>

      <FilterGroup title="Category">
        {categories.map((c) => (
          <FilterCheckbox
            key={c.id}
            label={c.name}
            checked={activeCategory === c.slug}
            onChange={() => updateParam("category", c.slug)}
          />
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup title="Occasion">
        {shopByOccasion.slice(0, 6).map((o) => (
          <FilterCheckbox
            key={o.slug}
            label={o.name}
            checked={activeOccasion === o.slug}
            onChange={() => updateParam("occasion", o.slug)}
          />
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup title="Price">
        {PRICE_BUCKETS.map((bucket) => {
          const checked = String(activeMin ?? "") === String(bucket.min ?? "") && String(activeMax ?? "") === String(bucket.max ?? "");
          return (
            <FilterCheckbox
              key={bucket.label}
              label={bucket.label}
              checked={checked}
              onChange={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (checked) {
                  params.delete("minPrice");
                  params.delete("maxPrice");
                } else {
                  if (bucket.min) params.set("minPrice", String(bucket.min));
                  else params.delete("minPrice");
                  if (bucket.max) params.set("maxPrice", String(bucket.max));
                  else params.delete("maxPrice");
                }
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
            />
          );
        })}
      </FilterGroup>

      <Separator />

      <FilterGroup title="Availability">
        <FilterCheckbox
          label="Featured"
          checked={searchParams.get("featured") === "true"}
          onChange={() => toggleBoolean("featured")}
        />
        <FilterCheckbox
          label="Best Seller"
          checked={searchParams.get("bestSeller") === "true"}
          onChange={() => toggleBoolean("bestSeller")}
        />
        <FilterCheckbox
          label="Customization Available"
          checked={searchParams.get("customizable") === "true"}
          onChange={() => toggleBoolean("customizable")}
        />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-forest-900">{title}</h4>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <Label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal text-charcoal-800">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </Label>
  );
}
