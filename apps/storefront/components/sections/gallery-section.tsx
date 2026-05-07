"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { galleryImages } from "@/lib/data/site";

export function GallerySection() {
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Di lapangan
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Asli dipakai
            <span className="text-muted"> — bukan mockup doang.</span>
          </h2>
          <p className="mt-4 text-muted">
            Potret tim, event kampus, dan komunitas dengan apparel Metro di dunia
            nyata.
          </p>
        </Reveal>

        <div className="mt-12 lg:hidden">
          <RevealStagger className="grid grid-cols-2 gap-3 sm:gap-4">
            {galleryImages.map((src, i) => (
              <RevealItem key={src}>
                <motion.div
                  className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-surface"
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <Image
                    src={src}
                    alt={`Galeri jersey ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out will-change-transform hover:scale-[1.05]"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </motion.div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>

        <RevealStagger className="mt-12 hidden gap-4 lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-auto lg:pb-4 lg:pt-1 [scrollbar-width:thin]">
          {galleryImages.map((src, i) => (
            <RevealItem
              key={src}
              className="relative w-[min(72vw,320px)] shrink-0 snap-center sm:w-[min(56vw,380px)]"
            >
              <motion.div
                className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-surface"
                whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              >
                <Image
                  src={src}
                  alt={`Galeri jersey ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out will-change-transform hover:scale-[1.06]"
                  sizes="380px"
                />
              </motion.div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
