import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingNotFound() {
  return (
    <div className="container-evora flex flex-col items-center justify-center gap-5 py-32 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-beige-100 text-forest-700">
        <Gift className="size-7" />
      </div>
      <h1 className="font-serif text-4xl text-forest-950">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to gifting.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Gifts</Link>
        </Button>
      </div>
    </div>
  );
}
