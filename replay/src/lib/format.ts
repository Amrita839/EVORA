export { rupees } from "./wording";

export const signedRupees = (n: number) => {
  const r = Math.round(Math.abs(n)).toLocaleString("en-IN");
  return Math.round(n) === 0 ? "₹0" : `${n < 0 ? "−" : "+"}₹${r}`;
};

export function holdText(minutes: number): string {
  if (minutes < 1) return "under 1 min";
  const m = Math.round(minutes);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;

export function downloadText(filename: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
