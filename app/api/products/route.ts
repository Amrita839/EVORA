import { NextResponse } from "next/server";
import { getProductsBySlugs } from "@/lib/db/products";
import { toProductCardData } from "@/types";

/** Batch product lookup by slug — used by the client-side "Recently Viewed" rail. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get("slugs");
  if (!slugsParam) {
    return NextResponse.json({ products: [] });
  }

  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  const products = await getProductsBySlugs(slugs);
  return NextResponse.json({ products: products.map(toProductCardData) });
}
