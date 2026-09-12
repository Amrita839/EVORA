import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Evora Gifting — Every Gift, Intentional",
    template: "%s | Evora Gifting",
  },
  description:
    "Thoughtfully curated gifts for people, teams and moments that matter. Corporate gifting, personalized keepsakes and festive hampers.",
  openGraph: {
    type: "website",
    siteName: "Evora Gifting",
    title: "Evora Gifting — Every Gift, Intentional",
    description:
      "Thoughtfully curated gifts for people, teams and moments that matter.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evora Gifting — Every Gift, Intentional",
    description:
      "Thoughtfully curated gifts for people, teams and moments that matter.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
