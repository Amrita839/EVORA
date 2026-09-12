import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
    );
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <PageLink href={hrefFor(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </PageLink>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .map((p, idx, arr) => (
          <span key={p} className="flex items-center gap-2">
            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground">…</span>}
            <PageLink href={hrefFor(p)} active={p === page}>
              {p}
            </PageLink>
          </span>
        ))}
      <PageLink href={hrefFor(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Next page">
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex size-9 items-center justify-center rounded-full text-muted-foreground/40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
        active ? "bg-forest-900 text-ivory-50" : "text-charcoal-800 hover:bg-muted"
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
