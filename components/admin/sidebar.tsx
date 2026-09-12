"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Inbox,
  Users,
  Quote,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-ivory-100/10 bg-forest-950 px-4 py-6">
      <Link href="/admin" className="mb-8 flex items-center gap-2 px-2 font-serif text-xl text-ivory-50">
        <Sparkles className="size-5 text-champagne-500" /> Evora Admin
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-ivory-50/10 text-ivory-50" : "text-ivory-100/60 hover:bg-ivory-50/5 hover:text-ivory-50"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pt-6">
        <Link href="/" className="text-xs text-ivory-100/40 hover:text-ivory-100/70">
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
