import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { newsletterSchema } from "@/lib/validation/schemas";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`newsletter:${getClientKey(request)}`, { limit: 5, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, whatsappOptIn, phoneNumber } = parsed.data;

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { whatsappOptIn, phoneNumber },
    create: { email, whatsappOptIn, phoneNumber },
  });

  return NextResponse.json({ ok: true });
}
