import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db/prisma";
import { isValidUuid } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidUuid(id)) notFound();

  const [product, categories, occasions, recipients] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        occasions: true,
        recipients: true,
      },
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    prisma.occasion.findMany({ orderBy: { name: "asc" } }),
    prisma.recipient.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <ProductForm
        categories={categories}
        occasions={occasions}
        recipients={recipients}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          price: product.price ? String(product.price) : "",
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          categoryId: product.categoryId ?? "",
          sku: product.sku ?? "",
          stockStatus: product.stockStatus,
          pricingMode: product.pricingMode,
          tags: product.tags.join(", "),
          material: product.material ?? "",
          color: product.color ?? "",
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          isNew: product.isNew,
          isActive: product.isActive,
          customizationAvailable: product.customizationAvailable,
          minimumOrderQuantity: String(product.minimumOrderQuantity),
          corporateAvailable: product.corporateAvailable,
          images: product.images.map((img) => ({ url: img.url, altText: img.altText ?? undefined })),
          occasionIds: product.occasions.map((o) => o.occasionId),
          recipientIds: product.recipients.map((r) => r.recipientId),
        }}
      />
    </div>
  );
}
