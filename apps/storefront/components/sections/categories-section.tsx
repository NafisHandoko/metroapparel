"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { categories } from "@/lib/data/site";

export function CategoriesSection() {
  const reduce = useReducedMotion();

  return (
    <section id="categories" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Kategori
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Fokus jersey.
            <span className="text-muted"> Siap skala lainnya.</span>
          </h2>
          <p className="mt-4 text-muted">
            Dari lapangan hingga ruang briefing — semua dengan DNA desain yang sama:
            tajam, kontras, dan siap branding.
          </p>
        </Reveal>
        <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <RevealItem key={cat.slug}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-white/10 bg-surface/60 transition-[border-color,box-shadow] duration-500 hover:border-brand/40 hover:shadow-[0_20px_48px_-20px_rgba(158,255,0,0.2)]"
              >
                <motion.div
                  className="relative aspect-[3/4]"
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 360, damping: 26 }}
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.06]"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </motion.div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-2xl text-foreground transition-colors duration-300 group-hover:text-brand">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{cat.description}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
