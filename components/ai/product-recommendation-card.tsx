"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useEnquiryCart } from "@/hooks/use-enquiry-cart";
import { trackEvent } from "@/lib/analytics/client";
import { buildWhatsAppLink, buildEnquiryMessage } from "@/lib/whatsapp/links";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function ProductRecommendationCard({ product }: { product: ProductCardData }) {
  const addLine = useEnquiryCart((s) => s.addLine);
  const image = product.images[0];

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-2.5">
      <Link href={`/products/${product.slug}`} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-beige-100">
        {image && <Image src={image.url} alt={product.name} fill sizes="64px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.slug}`} className="line-clamp-1 text-sm font-medium text-forest-900 hover:underline">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {product.pricingMode === "ENQUIRY_ONLY" ? "Enquire for pricing" : formatPrice(product.price)}
        </p>
        <div className="mt-1.5 flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              addLine({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: image?.url ?? null,
                price: product.price,
                pricingMode: product.pricingMode,
              });
              trackEvent("ADD_TO_ENQUIRY", { productId: product.id, source: "ai_assistant" });
              toast.success(`${product.name} added to your enquiry basket`);
            }}
          >
            Add to Enquiry
          </Button>
          {WHATSAPP_NUMBER && (
            <Button size="sm" variant="whatsapp" className="h-7 px-2.5 text-xs" asChild>
              <a
                href={buildWhatsAppLink(WHATSAPP_NUMBER, buildEnquiryMessage({ items: [{ name: product.name, quantity: 1 }] }))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("WHATSAPP_CLICK", { source: "ai_assistant", productId: product.id })}
              >
                WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
