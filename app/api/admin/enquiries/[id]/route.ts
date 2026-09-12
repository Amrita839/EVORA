import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthedAdmin } from "@/lib/auth/guard";
import { enquiryStatusSchema } from "@/lib/validation/schemas";
import { isValidUuid } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUuid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const body = await request.json().catch(() => null);
  const parsed = enquiryStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const enquiry = await prisma.enquiry.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ ok: true, enquiry });
}
