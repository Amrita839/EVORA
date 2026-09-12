"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { useEnquiryCart } from "@/hooks/use-enquiry-cart";
import { trackEvent } from "@/lib/analytics/client";
import type { ProductCardData } from "@/types";
import { toast } from "sonner";

export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const addLine = useEnquiryCart((s) => s.addLine);
  const image = product.images[0];
  const isEnquireOnly = product.pricingMode === "ENQUIRY_ONLY";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px 100px 0px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative flex flex-col", className)}
    >
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-beige-100">
        <div className="relative aspect-[4/5] w-full">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isBestSeller && <Badge variant="accent">Best Seller</Badge>}
          {product.compareAtPrice && <Badge variant="sale">Sale</Badge>}
        </div>

        <Button
          size="icon"
          variant="accent"
          aria-label="Quick add to enquiry"
          className="absolute bottom-3 right-3 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            addLine({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: image?.url ?? null,
              price: product.price ? Number(product.price) : null,
              pricingMode: product.pricingMode,
            });
            trackEvent("ADD_TO_ENQUIRY", { productId: product.id });
            toast.success(`${product.name} added to your enquiry basket`);
          }}
        >
          <Plus />
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-champagne-700">
            {product.category.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="font-serif text-lg leading-snug text-forest-900 hover:underline">
          {product.name}
        </Link>
        {product.shortDescription && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {isEnquireOnly ? (
            <span className="text-sm font-medium text-forest-700">Enquire for pricing</span>
          ) : (
            <>
              <span className="text-sm font-semibold text-forest-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
