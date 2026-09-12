import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductActions } from "@/components/products/product-actions";
import { ProductViewTracker } from "@/components/products/product-view-tracker";
import { RecentlyViewedRail } from "@/components/products/recently-viewed-rail";
import { ProductRail } from "@/components/home/product-rail";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/products";
import { toProductCardData } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku ?? undefined,
    offers:
      product.price != null
        ? {
            "@type": "Offer",
            priceCurrency: "INR",
            price: Number(product.price),
            availability:
              product.stockStatus === "IN_STOCK"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          }
        : undefined,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${siteUrl}/products` },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.category.name,
              item: `${siteUrl}/categories/${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
    <div className="container-evora py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductViewTracker productId={product.id} slug={product.slug} />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-forest-800">
          Shop
        </Link>
        <ChevronRight className="size-3.5" />
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-forest-800">
              {product.category.name}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        )}
        <span className="text-charcoal-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isBestSeller && <Badge variant="accent">Best Seller</Badge>}
            {product.customizationAvailable && <Badge variant="outline">Customizable</Badge>}
            {product.corporateAvailable && <Badge variant="outline">Corporate Available</Badge>}
          </div>

          <h1 className="font-serif text-3xl text-forest-950 sm:text-4xl">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            {product.pricingMode === "ENQUIRY_ONLY" ? (
              <span className="text-xl font-medium text-forest-800">Enquire for pricing</span>
            ) : (
              <>
                <span className="text-2xl font-semibold text-forest-900">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </>
            )}
          </div>

          {product.shortDescription && <p className="text-muted-foreground">{product.shortDescription}</p>}

          <ProductActions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              pricingMode: product.pricingMode,
              minimumOrderQuantity: product.minimumOrderQuantity,
              corporateAvailable: product.corporateAvailable,
              price: product.price ? Number(product.price) : null,
              imageUrl: product.images[0]?.url ?? null,
            }}
          />

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-6">
            <h2 className="font-serif text-lg text-forest-950">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal-800">{product.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-6 text-sm">
            {product.material && (
              <div>
                <dt className="text-muted-foreground">Material</dt>
                <dd className="font-medium text-forest-900">{product.material}</dd>
              </div>
            )}
            {product.color && (
              <div>
                <dt className="text-muted-foreground">Color</dt>
                <dd className="font-medium text-forest-900">{product.color}</dd>
              </div>
            )}
            {product.sku && (
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium text-forest-900">{product.sku}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Availability</dt>
              <dd className="font-medium text-forest-900">
                {product.stockStatus.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </dd>
            </div>
          </dl>

          {(product.occasions.length > 0 || product.recipients.length > 0) && (
            <div className="flex flex-col gap-2 border-t border-border pt-6">
              {product.occasions.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-forest-900">Occasions: </span>
                  {product.occasions.map((po) => po.occasion.name).join(", ")}
                </p>
              )}
              {product.recipients.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-forest-900">Recipients: </span>
                  {product.recipients.map((pr) => pr.recipient.name).join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      <ProductRail
        eyebrow="You May Also Like"
        title="Related gifts"
        products={related.map(toProductCardData)}
        viewAllHref={product.category ? `/categories/${product.category.slug}` : "/products"}
      />

      <RecentlyViewedRail excludeSlug={product.slug} />
    </>
  );
}
