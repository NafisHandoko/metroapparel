"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { useSiteContent } from "@/components/site-content-provider";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export function TestimonialsSection() {
  const { testimonials } = useSiteContent();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;

  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Testimoni
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Suara dari garis depan
          </h2>
        </Reveal>
        <RevealStagger className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.name}>
              <motion.blockquote
                className="flex h-full flex-col rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 transition-[border-color,box-shadow] duration-500 hover:border-brand/35 hover:shadow-[0_16px_40px_-18px_rgba(158,255,0,0.22)]"
                whileHover={reduce ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <p className="flex-1 text-sm leading-relaxed text-muted">
                  &ldquo;{t.message}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/40 bg-brand/10 font-display text-sm text-brand"
                    aria-hidden
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
