"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest-950">
      <div className="absolute inset-0">
        <Image src="/images/hero.svg" alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-forest-950/20" />
      </div>

      <div className="container-evora relative flex min-h-[86vh] flex-col items-center justify-center py-24 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 rounded-full border border-champagne-500/40 bg-champagne-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-champagne-300"
        >
          Corporate &amp; Personal Gifting
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl text-balance font-serif text-5xl italic leading-[1.08] text-ivory-50 sm:text-6xl lg:text-7xl"
        >
          Every gift, intentional.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mt-6 max-w-xl text-balance text-lg text-ivory-100/80"
        >
          Thoughtfully curated gifts for people, teams and moments that matter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" variant="accent" asChild>
            <Link href="/products">Explore Gifts</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-ivory-100/40 text-ivory-50 hover:bg-ivory-50 hover:text-forest-900"
            asChild
          >
            <Link href="/corporate-gifting">Corporate Gifting</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
