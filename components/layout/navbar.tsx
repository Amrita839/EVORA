"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, Search, ShoppingBag, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useEnquiryCart } from "@/hooks/use-enquiry-cart";
import { useAiWidget } from "@/hooks/use-ai-widget";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { SearchDialog } from "@/components/shared/search-dialog";

export function Navbar({ companyName }: { companyName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useHasMounted();
  const totalItems = useEnquiryCart((s) => s.totalItems());
  const openAiWidget = useAiWidget((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-ivory-50/85 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(20,34,24,0.04)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container-evora flex h-[4.5rem] items-center justify-between py-4">
        <Link href="/" className="font-serif text-2xl tracking-tight text-forest-900">
          {companyName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-charcoal-800 transition-colors hover:text-forest-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ask Evora — AI gifting assistant"
            onClick={() => openAiWidget()}
            className="hidden sm:inline-flex"
          >
            <Sparkles />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account" asChild className="hidden sm:inline-flex">
            <Link href="/admin/login">
              <User />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Enquiry basket" asChild className="relative">
            <Link href="/cart">
              <ShoppingBag />
              {mounted && totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-foreground"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{companyName}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {mainNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-base font-medium text-charcoal-800 transition-colors hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
                <SheetClose asChild>
                  <Button variant="outline" onClick={() => openAiWidget()}>
                    <Sparkles /> Ask Evora
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
