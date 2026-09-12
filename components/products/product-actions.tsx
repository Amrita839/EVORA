"use client";

import { useState } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { useEnquiryCart } from "@/hooks/use-enquiry-cart";
import { useAiWidget } from "@/hooks/use-ai-widget";
import { trackEvent } from "@/lib/analytics/client";
import { buildEnquiryMessage } from "@/lib/whatsapp/links";
import type { Product } from "@prisma/client";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export type ProductActionsData = Pick<
  Product,
  "id" | "slug" | "name" | "pricingMode" | "minimumOrderQuantity" | "corporateAvailable"
> & { price: number | null; imageUrl: string | null };

export function ProductActions({ product }: { product: ProductActionsData }) {
  const [quantity, setQuantity] = useState(product.minimumOrderQuantity || 1);
  const addLine = useEnquiryCart((s) => s.addLine);
  const openAi = useAiWidget((s) => s.open);
  const image = product.imageUrl;

  const canBuy = product.pricingMode === "BUYABLE" || product.pricingMode === "BOTH";
  const isEnquireOnly = product.pricingMode === "ENQUIRY_ONLY";

  function handleAddToEnquiry() {
    addLine(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: image ?? null,
        price: product.price,
        pricingMode: product.pricingMode,
      },
      quantity
    );
    trackEvent("ADD_TO_ENQUIRY", { productId: product.id, quantity });
    toast.success(`${product.name} (×${quantity}) added to your enquiry basket`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-forest-900">Quantity</span>
        <div className="flex items-center rounded-full border border-border">
          <button
            className="flex size-9 items-center justify-center text-charcoal-800 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(product.minimumOrderQuantity || 1, q - 1))}
            disabled={quantity <= (product.minimumOrderQuantity || 1)}
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            className="flex size-9 items-center justify-center text-charcoal-800"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        {product.minimumOrderQuantity > 1 && (
          <span className="text-xs text-muted-foreground">Min. order {product.minimumOrderQuantity}</span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={handleAddToEnquiry} className="flex-1">
          Add to Enquiry
        </Button>
        {WHATSAPP_NUMBER && (
          <WhatsAppButton
            size="lg"
            className="flex-1"
            phoneNumber={WHATSAPP_NUMBER}
            source="product_page"
            message={buildEnquiryMessage({ items: [{ name: product.name, quantity }] })}
            label="Chat on WhatsApp"
          />
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => openAi(`Tell me more about ${product.name}`)}
        className="w-fit"
      >
        <Sparkles /> Ask AI about this gift
      </Button>

      {isEnquireOnly && (
        <p className="text-xs text-muted-foreground">
          This item is available by enquiry only — pricing depends on quantity and customization.
        </p>
      )}
      {!isEnquireOnly && canBuy && product.corporateAvailable && (
        <p className="text-xs text-muted-foreground">Available for bulk/corporate orders — enquire for volume pricing.</p>
      )}
    </div>
  );
}
