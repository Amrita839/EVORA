import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | string | { toString(): string } | null | undefined): string {
  if (value === null || value === undefined) return "";
  const num = typeof value === "number" ? value : Number(value.toString());
  if (Number.isNaN(num)) return "";
  return rupeeFormatter.format(num);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Generates (or reads) a stable anonymous session id, stored in localStorage. */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "evora_session_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates a string is a UUID before it's used in a Prisma `@db.Uuid`
 * query — Postgres/Prisma throws (500, not a clean 404/400) on a malformed
 * UUID literal, so route handlers must check this first.
 */
export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}
