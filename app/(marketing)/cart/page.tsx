"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { useEnquiryCart } from "@/hooks/use-enquiry-cart";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatPrice } from "@/lib/utils";
import { buildEnquiryMessage } from "@/lib/whatsapp/links";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default function CartPage() {
  const { lines, removeLine, updateQuantity } = useEnquiryCart();
  const mounted = useHasMounted();

  if (!mounted) {
    return <div className="container-evora py-20" />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-evora py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your enquiry basket is empty"
          description="Browse our collections and add gifts you'd like to know more about."
          action={
            <Button asChild>
              <Link href="/products">Explore Gifts</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const message = buildEnquiryMessage({ items: lines.map((l) => ({ name: l.name, quantity: l.quantity })) });

  return (
    <div className="container-evora py-14">
      <h1 className="mb-8 font-serif text-4xl text-forest-950">Your Enquiry Basket</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col divide-y divide-border">
          {lines.map((line) => (
            <div key={line.productId} className="flex items-center gap-4 py-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-beige-100">
                {line.image && <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${line.slug}`} className="font-medium text-forest-900 hover:underline">
                  {line.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {line.pricingMode === "ENQUIRY_ONLY" ? "Enquire for pricing" : formatPrice(line.price)}
                </p>
              </div>
              <div className="flex items-center rounded-full border border-border">
                <button
                  className="flex size-8 items-center justify-center text-charcoal-800"
                  onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-sm">{line.quantity}</span>
                <button
                  className="flex size-8 items-center justify-center text-charcoal-800"
                  onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                className="text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => removeLine(line.productId)}
                aria-label={`Remove ${line.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-forest-950">Ready to enquire?</h2>
          <p className="text-sm text-muted-foreground">
            Send this list to our team for pricing, availability and customization options.
          </p>
          <Button size="lg" asChild>
            <Link href="/enquiry">Send Enquiry</Link>
          </Button>
          {WHATSAPP_NUMBER && (
            <WhatsAppButton
              size="lg"
              phoneNumber={WHATSAPP_NUMBER}
              message={message}
              source="cart"
              label="Enquire on WhatsApp"
            />
          )}
        </div>
      </div>
    </div>
  );
}
