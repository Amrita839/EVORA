import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-20 text-center", className)}>
      {Icon && (
        <div className="flex size-14 items-center justify-center rounded-full bg-beige-100 text-forest-700">
          <Icon className="size-6" />
        </div>
      )}
      <h3 className="font-serif text-xl text-forest-950">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
