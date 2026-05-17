"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { whyUs } from "@/lib/data/site";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export function WhyUsSection() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;

  return (
    <section id="why" className="scroll-mt-24 border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Kenapa Pilih Metro Apparel
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Buat tim yang mau jersey rapi,
              <span className="block text-muted">tanpa ribet.</span>
            </h2>
          </Reveal>
          <Reveal className="max-w-md lg:text-right" delay={0.06}>
            <p className="text-sm leading-relaxed text-muted">
              Fokus kami sederhana: jersey yang nyaman dipakai, desain yang bisa kamu ubah sampai cocok, dan proses yang jelas biar kamu tidak nebak-nebak sendirian.
            </p>
          </Reveal>
        </div>
        <RevealStagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item) => (
            <RevealItem key={item.title}>
              <motion.div
                className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-[border-color,box-shadow] duration-500 hover:border-brand/30 hover:shadow-[0_12px_36px_-16px_rgba(158,255,0,0.18)]"
                whileHover={reduce ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <div className="mb-4 h-px w-10 bg-brand shadow-[0_0_12px_rgba(158,255,0,0.5)]" />
                <h3 className="font-display text-xl text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
