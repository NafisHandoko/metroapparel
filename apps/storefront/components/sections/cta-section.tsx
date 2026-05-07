"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { site } from "@/lib/data/site";

export function CtaSection() {
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/12 via-surface to-background px-6 py-16 shadow-[0_0_60px_-20px_rgba(158,255,0,0.35)] sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80 mix-blend-screen animate-gradient-drift motion-reduce:animate-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 20%, color-mix(in oklab, var(--brand) 28%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 75%, color-mix(in oklab, var(--brand) 18%, transparent), transparent 50%)",
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand/25 blur-3xl"
            animate={
              reduce
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }
            }
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand/15 blur-3xl animate-cta-pulse motion-reduce:animate-none"
          />
          <Reveal className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Siap bikin jersey custom tim kamu?
            </h2>
            <p className="mt-4 text-muted">
              Ceritakan kebutuhan tim, deadline event, dan referensi desain — kami
              balas dengan opsi bahan & estimasi yang jelas.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="xl" className="shadow-[0_0_40px_-6px_rgba(158,255,0,0.55)]">
                <a
                  href={getWhatsAppLink(
                    `Halo ${site.name}, kami siap diskusi jersey custom untuk tim.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat WhatsApp sekarang
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
