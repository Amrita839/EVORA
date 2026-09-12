"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/sidebar";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";

export function AdminHeader({ title, userLabel }: { title: string; userLabel: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-forest-950 p-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="font-serif text-xl text-forest-950">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{userLabel}</span>
        <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
