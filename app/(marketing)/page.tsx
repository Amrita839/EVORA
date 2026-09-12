import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { ProductRail } from "@/components/home/product-rail";
import { ShopByOccasion } from "@/components/home/shop-by-occasion";
import { CorporateSection } from "@/components/home/corporate-section";
import { PersonalizationSection } from "@/components/home/personalization-section";
import { WhyEvora } from "@/components/home/why-evora";
import { AiTeaser } from "@/components/home/ai-teaser";
import { Testimonials } from "@/components/home/testimonials";
import { SocialInspiration } from "@/components/home/social-inspiration";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getActiveCategories, getPublishedTestimonials } from "@/lib/db/categories";
import { getBestSellers, getFeaturedProducts } from "@/lib/db/products";
import { toProductCardData } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, bestSellers, featured, testimonials] = await Promise.all([
    getActiveCategories(),
    getBestSellers(8),
    getFeaturedProducts(8),
    getPublishedTestimonials(6),
  ]);

  return (
    <>
      <Hero />
      <FeaturedCollections categories={categories} />
      <ProductRail
        eyebrow="Best Sellers"
        title="Loved again and again"
        description="The gifts our clients come back for."
        products={bestSellers.map(toProductCardData)}
        viewAllHref="/products?bestSeller=true"
        tone="muted"
      />
      <ShopByOccasion />
      <CorporateSection />
      <ProductRail
        eyebrow="Featured"
        title="This season's picks"
        products={featured.map(toProductCardData)}
        viewAllHref="/products?featured=true"
      />
      <PersonalizationSection />
      <WhyEvora />
      <AiTeaser />
      <Testimonials testimonials={testimonials} />
      <SocialInspiration />
      <NewsletterSection />
    </>
  );
}
