import type { Metadata } from "next";
import Image from "next/image";
import { whyEvora } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About",
  description: "About Evora Gifting — thoughtfully curated gifts for people, teams and moments that matter.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-evora py-14">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">About Us</span>
          <h1 className="text-balance font-serif text-4xl text-forest-950 sm:text-5xl">{settings.tagline}</h1>
          <p className="text-muted-foreground">
            {settings.companyName} is a gifting studio built around one idea: a gift should feel considered, not
            generic. We work with individuals and businesses to curate, customize and deliver gifts for the people
            and moments that matter — from a single personalized keepsake to gifting programs for entire teams.
          </p>
          <p className="text-muted-foreground">
            Every product in our catalog is selected with a recipient in mind, and every enquiry is handled by a
            real person — not an automated checkout. Whether you&apos;re gifting one person or five hundred, we aim
            to make the process feel personal.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image src="/images/categories/luxury-gifts.svg" alt="About Evora Gifting" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {whyEvora.map((item) => (
          <div key={item.title} className="flex flex-col gap-2">
            <h3 className="font-serif text-lg text-forest-950">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
