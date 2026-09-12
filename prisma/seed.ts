/**
 * Seed script for EVORA GIFTING.
 *
 * Populates demo data so the platform is immediately explorable. Every
 * product created here is flagged `isDemo: true` so the owner (or an admin)
 * can identify and bulk-replace sample data without guesswork — see the
 * README "Replacing demo data" section.
 *
 * Run with: `npm run db:seed`
 */
import { PrismaClient, PricingMode, StockStatus } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Corporate Gifts", slug: "corporate-gifts", description: "Premium gifting solutions for clients, partners and teams.", sortOrder: 1 },
  { name: "Festive Gifts", slug: "festive-gifts", description: "Curated hampers for Diwali, New Year and seasonal celebrations.", sortOrder: 2 },
  { name: "Employee Gifting", slug: "employee-gifting", description: "Welcome kits, milestones and appreciation gifts for teams.", sortOrder: 3 },
  { name: "Personalized Gifts", slug: "personalized-gifts", description: "Custom-branded and monogrammed keepsakes.", sortOrder: 4 },
  { name: "Luxury Gifts", slug: "luxury-gifts", description: "Statement gifting for special occasions and VIP relationships.", sortOrder: 5 },
] as const;

const OCCASIONS = ["Birthday", "Wedding", "Anniversary", "Festive", "Corporate", "Employee Onboarding", "Client Appreciation", "Welcome", "Thank You"];

const RECIPIENTS = ["Employees", "Clients", "Colleagues", "Family", "Friends", "Business Partners", "New Joiners", "Leadership"];

const PRODUCTS = [
  {
    name: "Executive Gift Box",
    category: "corporate-gifts",
    price: 2499,
    compareAtPrice: 2999,
    shortDescription: "A refined desk companion set for leaders and clients.",
    description:
      "A thoughtfully assembled box featuring a premium notebook, metal pen, and coaster set — packaged in a signature Evora keepsake box. A dependable choice for client relationships and leadership milestones.",
    tags: ["executive", "desk", "premium"],
    occasions: ["Corporate", "Thank You"],
    recipients: ["Clients", "Leadership"],
    isFeatured: true,
    isBestSeller: true,
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    customizationAvailable: true,
    minimumOrderQuantity: 1,
  },
  {
    name: "Premium Desk Hamper",
    category: "corporate-gifts",
    price: 1899,
    shortDescription: "Everything a modern workspace needs, beautifully boxed.",
    description:
      "A curated desk hamper with an organizer tray, notebook, and premium stationery — ideal for onboarding kits or client appreciation drops.",
    tags: ["desk", "hamper", "office"],
    occasions: ["Corporate", "Welcome"],
    recipients: ["Employees", "New Joiners"],
    isFeatured: true,
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    minimumOrderQuantity: 5,
  },
  {
    name: "Personalized Notebook Set",
    category: "personalized-gifts",
    price: 899,
    shortDescription: "Monogrammed notebooks for a personal touch.",
    description:
      "A pair of premium hardbound notebooks with monogram or logo embossing, in your choice of colour. A small gesture that reads as thoughtful.",
    tags: ["personalized", "notebook", "stationery"],
    occasions: ["Birthday", "Thank You"],
    recipients: ["Colleagues", "Friends"],
    isNew: true,
    pricingMode: PricingMode.BOTH,
    customizationAvailable: true,
    minimumOrderQuantity: 1,
  },
  {
    name: "Corporate Wellness Hamper",
    category: "corporate-gifts",
    price: 2199,
    shortDescription: "A gesture of care — wellness essentials for busy teams.",
    description:
      "Herbal tea, aromatic candles and a wellness journal come together in this hamper designed to make employees and clients feel genuinely looked after.",
    tags: ["wellness", "hamper", "self-care"],
    occasions: ["Employee Onboarding", "Thank You"],
    recipients: ["Employees", "Clients"],
    isBestSeller: true,
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    minimumOrderQuantity: 10,
  },
  {
    name: "Luxury Tea & Coffee Box",
    category: "luxury-gifts",
    price: 3499,
    shortDescription: "An indulgent selection for the connoisseur.",
    description:
      "Hand-picked single-origin coffee and specialty teas presented in an elegant keepsake box — a statement gift for VIP relationships.",
    tags: ["luxury", "tea", "coffee"],
    occasions: ["Festive", "Client Appreciation"],
    recipients: ["Clients", "Business Partners"],
    isFeatured: true,
    pricingMode: PricingMode.ENQUIRY_ONLY,
    corporateAvailable: true,
    minimumOrderQuantity: 1,
  },
  {
    name: "Employee Welcome Kit",
    category: "employee-gifting",
    price: 1499,
    shortDescription: "First-day essentials that make a lasting impression.",
    description:
      "A branded tote bag, notebook, tumbler and welcome card — everything a new joiner needs to feel at home from day one.",
    tags: ["welcome", "onboarding", "kit"],
    occasions: ["Employee Onboarding", "Welcome"],
    recipients: ["New Joiners", "Employees"],
    isBestSeller: true,
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    customizationAvailable: true,
    minimumOrderQuantity: 10,
  },
  {
    name: "Premium Festive Hamper",
    category: "festive-gifts",
    price: 2799,
    compareAtPrice: 3199,
    shortDescription: "A generous festive spread for the season of giving.",
    description:
      "Assorted dry fruits, artisanal sweets and a scented candle, packaged in festive Evora signature packaging — perfect for Diwali and year-end gifting.",
    tags: ["festive", "diwali", "hamper"],
    occasions: ["Festive"],
    recipients: ["Clients", "Employees", "Family"],
    isFeatured: true,
    isBestSeller: true,
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    minimumOrderQuantity: 1,
  },
  {
    name: "Client Appreciation Box",
    category: "corporate-gifts",
    price: 3199,
    shortDescription: "A premium gesture of thanks for valued clients.",
    description:
      "A refined selection of gourmet snacks, a leather-bound journal and a handwritten note card — designed to strengthen client relationships.",
    tags: ["client", "appreciation", "premium"],
    occasions: ["Client Appreciation", "Thank You"],
    recipients: ["Clients"],
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    minimumOrderQuantity: 1,
  },
  {
    name: "Personalized Travel Kit",
    category: "personalized-gifts",
    price: 1699,
    shortDescription: "Monogrammed travel essentials for the modern professional.",
    description:
      "A compact passport holder, luggage tag and travel pouch set, available with initials or logo embossing.",
    tags: ["travel", "personalized"],
    occasions: ["Birthday", "Thank You"],
    recipients: ["Colleagues", "Friends", "Family"],
    isNew: true,
    pricingMode: PricingMode.BOTH,
    customizationAvailable: true,
    minimumOrderQuantity: 1,
  },
  {
    name: "Minimal Desk Essentials",
    category: "employee-gifting",
    price: 999,
    shortDescription: "Clean, minimal desk accessories for everyday work.",
    description:
      "A pared-back set of a notebook, pen and card holder in muted tones — an understated gift that suits any workspace.",
    tags: ["minimal", "desk", "budget-friendly"],
    occasions: ["Employee Onboarding", "Thank You"],
    recipients: ["Employees", "Colleagues"],
    pricingMode: PricingMode.BOTH,
    corporateAvailable: true,
    minimumOrderQuantity: 10,
  },
] as const;

const TESTIMONIALS = [
  {
    authorName: "Ananya Rao",
    authorRole: "HR Lead",
    company: "Sample Client Co.",
    content: "Evora made our employee onboarding kits feel genuinely special — the whole team noticed the difference.",
    rating: 5,
    sortOrder: 1,
  },
  {
    authorName: "Vikram Shah",
    authorRole: "Founder",
    company: "Sample Studio",
    content: "Ordering client gifts used to be a scramble every festive season. Evora's enquiry process made it simple.",
    rating: 5,
    sortOrder: 2,
  },
  {
    authorName: "Meera Nair",
    authorRole: "Operations Manager",
    company: "Sample Enterprises",
    content: "The customization options and packaging quality were exactly what we needed for a client-facing gift.",
    rating: 4,
    sortOrder: 3,
  },
];

async function main() {
  console.log("Seeding EVORA GIFTING demo data...");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Evora Gifting",
      tagline: "Every gift, intentional",
      email: "hello@evoragifting.com",
      phone: "+91 90000 00000",
      whatsappNumber: "911234567890",
      address: "Sample Address, India",
      whatsappEnabled: false,
      corporateInfo:
        "We support bulk and corporate gifting with custom branding, curated selections and dedicated support for orders of any size. Configure this copy from Admin → Settings.",
      customGiftingInfo:
        "Personalize gifts with monograms, logos and custom messaging. Exact customization capabilities should be confirmed with the Evora team and configured here.",
      footerText: "Thoughtfully curated gifts for people, teams and moments that matter.",
    },
  });

  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  const occasionMap = new Map<string, string>();
  for (const name of OCCASIONS) {
    const slug = slugify(name);
    const created = await prisma.occasion.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    occasionMap.set(name, created.id);
  }

  const recipientMap = new Map<string, string>();
  for (const name of RECIPIENTS) {
    const slug = slugify(name);
    const created = await prisma.recipient.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    recipientMap.set(name, created.id);
  }

  for (const [index, p] of PRODUCTS.entries()) {
    const slug = slugify(p.name);
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: "compareAtPrice" in p ? p.compareAtPrice : null,
        categoryId: categoryMap.get(p.category),
        sku: `EVR-${String(index + 1).padStart(4, "0")}`,
        stockStatus: StockStatus.IN_STOCK,
        pricingMode: p.pricingMode,
        tags: [...p.tags],
        isFeatured: "isFeatured" in p ? p.isFeatured : false,
        isBestSeller: "isBestSeller" in p ? p.isBestSeller : false,
        isNew: "isNew" in p ? p.isNew : false,
        isDemo: true,
        customizationAvailable: "customizationAvailable" in p ? p.customizationAvailable : false,
        minimumOrderQuantity: p.minimumOrderQuantity,
        corporateAvailable: "corporateAvailable" in p ? p.corporateAvailable : false,
        metaTitle: `${p.name} | Evora Gifting`,
        metaDescription: p.shortDescription,
        images: {
          create: [
            {
              url: `/images/products/${slug}.svg`,
              altText: p.name,
              sortOrder: 0,
            },
          ],
        },
        occasions: {
          create: p.occasions.map((o) => ({ occasionId: occasionMap.get(o)! })),
        },
        recipients: {
          create: p.recipients.map((r) => ({ recipientId: recipientMap.get(r)! })),
        },
      },
    });
    console.log(`  + product: ${product.name}`);
  }

  for (const t of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }

  console.log("Seed complete.");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
