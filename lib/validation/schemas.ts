import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email(),
  whatsappOptIn: z.boolean().default(false),
  phoneNumber: z.string().optional(),
});

export const enquiryItemSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string(),
  quantity: z.number().int().min(1).max(100000),
});

export const enquirySchema = z.object({
  type: z.enum(["GENERAL", "CORPORATE", "CUSTOM"]).default("GENERAL"),
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().max(150).optional(),
  message: z.string().max(2000).optional(),
  items: z.array(enquiryItemSchema).default([]),
  whatsappOptIn: z.boolean().default(false),
  source: z
    .enum(["WEBSITE", "WHATSAPP", "AI_ASSISTANT", "CORPORATE_FORM", "CUSTOM_FORM", "CONTACT_FORM"])
    .default("WEBSITE"),
  sessionId: z.string().optional(),
});

export const corporateQuoteSchema = z.object({
  name: z.string().min(1).max(120),
  company: z.string().min(1).max(150),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  quantity: z.number().int().min(1).max(1000000),
  budgetPerGift: z.number().min(0).optional(),
  occasion: z.string().max(120).optional(),
  deliveryTimeline: z.string().max(120).optional(),
  customizationRequired: z.boolean().default(false),
  message: z.string().max(2000).optional(),
  whatsappOptIn: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(1).max(2000),
  whatsappOptIn: z.boolean().default(false),
});

export const aiChatSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(10)
    .default([]),
});

export const productImageSchema = z.object({
  url: z.string().min(1),
  altText: z.string().optional(),
});

export const adminProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0).nullable().optional(),
  compareAtPrice: z.number().min(0).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().max(100).optional(),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER"]).default("IN_STOCK"),
  pricingMode: z.enum(["BUYABLE", "ENQUIRY_ONLY", "BOTH"]).default("BOTH"),
  tags: z.array(z.string()).default([]),
  material: z.string().max(120).optional(),
  color: z.string().max(60).optional(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  customizationAvailable: z.boolean().default(false),
  minimumOrderQuantity: z.number().int().min(1).default(1),
  corporateAvailable: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(300).optional(),
  images: z.array(productImageSchema).default([]),
  occasionIds: z.array(z.string().uuid()).default([]),
  recipientIds: z.array(z.string().uuid()).default([]),
});

export const adminCategorySchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const adminTestimonialSchema = z.object({
  authorName: z.string().min(1).max(150),
  authorRole: z.string().max(150).optional(),
  company: z.string().max(150).optional(),
  content: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const adminSettingsSchema = z.object({
  companyName: z.string().min(1).max(150),
  tagline: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsappNumber: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  footerText: z.string().max(300).optional(),
  businessHours: z.string().max(200).optional(),
  whatsappEnabled: z.boolean().default(false),
  corporateInfo: z.string().max(1000).optional(),
  customGiftingInfo: z.string().max(1000).optional(),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "CONVERTED", "CLOSED"]),
});

export const leadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]),
});

export const trackEventSchema = z.object({
  type: z.enum([
    "PAGE_VIEW",
    "PRODUCT_VIEW",
    "PRODUCT_CLICK",
    "SEARCH",
    "AI_MESSAGE",
    "ADD_TO_ENQUIRY",
    "WHATSAPP_CLICK",
    "ENQUIRY_SUBMITTED",
    "CORPORATE_QUOTE",
    "NEWSLETTER_SIGNUP",
  ]),
  sessionId: z.string().optional(),
  path: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
