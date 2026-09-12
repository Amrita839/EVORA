"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/header";

const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/admin", title: "Overview" },
  { match: (p) => p === "/admin/products/new", title: "New Product" },
  { match: (p) => /^\/admin\/products\/[^/]+$/.test(p), title: "Edit Product" },
  { match: (p) => p.startsWith("/admin/products"), title: "Products" },
  { match: (p) => p.startsWith("/admin/categories"), title: "Categories" },
  { match: (p) => p.startsWith("/admin/enquiries"), title: "Enquiries" },
  { match: (p) => p.startsWith("/admin/leads"), title: "Leads" },
  { match: (p) => p.startsWith("/admin/testimonials"), title: "Testimonials" },
  { match: (p) => p.startsWith("/admin/analytics"), title: "Analytics" },
  { match: (p) => p.startsWith("/admin/settings"), title: "Settings" },
];

export function AdminHeaderTitle({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();
  const title = TITLES.find((t) => t.match(pathname))?.title ?? "Admin";

  return <AdminHeader title={title} userLabel={userLabel} />;
}
