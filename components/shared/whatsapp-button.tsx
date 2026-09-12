"use client";

import { MessageCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp/links";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export function WhatsAppButton({
  phoneNumber,
  message,
  label = "Chat on WhatsApp",
  variant = "whatsapp",
  size = "default",
  source,
  className,
}: {
  phoneNumber: string;
  message: string;
  label?: string;
  source?: string;
  className?: string;
} & VariantProps<typeof buttonVariants>) {
  return (
    <Button variant={variant} size={size} className={cn(className)} asChild>
      <a
        href={buildWhatsAppLink(phoneNumber, message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("WHATSAPP_CLICK", { source })}
      >
        <MessageCircle /> {label}
      </a>
    </Button>
  );
}
