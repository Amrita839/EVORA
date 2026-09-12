import type { Product, ProductImage, Category, Occasion, Recipient } from "@prisma/client";

/** Product shape as returned by the catalog queries — includes relations the UI needs. */
export type ProductWithRelations = Product & {
  images: ProductImage[];
  category: Category | null;
  occasions: { occasion: Occasion }[];
  recipients: { recipient: Recipient }[];
};

export type ProductCardData = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "shortDescription"
  | "pricingMode"
  | "stockStatus"
  | "isFeatured"
  | "isBestSeller"
  | "isNew"
  | "customizationAvailable"
> & {
  price: number | null;
  compareAtPrice: number | null;
  images: Pick<ProductImage, "url" | "altText">[];
  category: Pick<Category, "name" | "slug"> | null;
};

/** Converts a Prisma product (with Decimal fields) into the plain, client-safe card shape. */
export function toProductCardData(product: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: { toString(): string } | null;
  compareAtPrice: { toString(): string } | null;
  pricingMode: Product["pricingMode"];
  stockStatus: Product["stockStatus"];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  customizationAvailable: boolean;
  images: Pick<ProductImage, "url" | "altText">[];
  category: Pick<Category, "name" | "slug"> | null;
}): ProductCardData {
  return {
    ...product,
    price: product.price ? Number(product.price.toString()) : null,
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice.toString()) : null,
  };
}

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  pricingMode: "BUYABLE" | "ENQUIRY_ONLY" | "BOTH";
  quantity: number;
};

/** Structured response shape returned by the AI assistant API. */
export type AiAssistantResponse = {
  message: string;
  productIds: string[];
  action: "SHOW_PRODUCTS" | "NAVIGATE" | "NONE";
  navigateTo?: string;
};

export type SearchFilters = {
  q?: string;
  category?: string;
  occasion?: string;
  recipient?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestSeller?: boolean;
  customizable?: boolean;
};
