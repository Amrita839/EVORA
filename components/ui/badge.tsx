import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        accent: "bg-accent text-accent-foreground border-transparent",
        outline: "border-border text-foreground bg-transparent",
        muted: "bg-muted text-muted-foreground border-transparent",
        new: "bg-forest-800 text-ivory-50 border-transparent",
        sale: "bg-destructive text-destructive-foreground border-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
