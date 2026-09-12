import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">{eyebrow}</span>
      )}
      <h2 className="max-w-xl text-balance font-serif text-3xl text-forest-950 sm:text-4xl">{title}</h2>
      {description && <p className="max-w-xl text-balance text-muted-foreground">{description}</p>}
    </div>
  );
}
