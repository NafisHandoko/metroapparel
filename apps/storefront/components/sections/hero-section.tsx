"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { site } from "@/lib/data/site";

const heroImage =
  "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=1920&q=85";

const textContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const textItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function HeroSection() {
  const reduce = useReducedMotion();
  const textContainerVariants = reduce
    ? { hidden: {}, visible: { transition: { staggerChildren: 0, delayChildren: 0 } } }
    : textContainer;
  const textItemVariants = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : textItem;
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 48]);
  const imageYSpring = useSpring(imageY, { stiffness: 120, damping: 28 });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.35);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${mouseX} ${mouseY}, color-mix(in oklab, var(--brand) 22%, transparent), transparent 55%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mouseX.set(Math.min(1, Math.max(0, x)));
    mouseY.set(Math.min(1, Math.max(0, y)));
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="relative min-h-[85vh] overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: imageYSpring }}
      >
        <Image
          src={heroImage}
          alt="Tim dengan jersey custom"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90 mix-blend-screen"
          style={{ background: glow }}
          animate={{ opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/3 h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-brand/15 blur-[100px]"
        animate={
          reduce
            ? undefined
            : { y: [0, -14, 0], scale: [1, 1.04, 1], opacity: [0.35, 0.55, 0.35] }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(70vw,420px)] w-[min(70vw,420px)] rounded-full bg-brand/10 blur-[90px]"
        animate={
          reduce
            ? undefined
            : { y: [0, 12, 0], scale: [1, 1.06, 1], opacity: [0.25, 0.45, 0.25] }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-end gap-8 px-4 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28 lg:pt-40">
        <motion.div
          className="max-w-3xl space-y-6"
          variants={textContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={textItemVariants}
            className="text-xs font-semibold uppercase tracking-[0.35em] text-brand"
          >
            Custom apparel · Tim · Komunitas · Institusi
          </motion.p>
          <motion.h1
            variants={textItemVariants}
            className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            JERSEY CUSTOM
            <span className="mt-1 block text-brand drop-shadow-[0_0_28px_rgba(158,255,0,0.35)]">
              TANPA KOMPROMI
            </span>
          </motion.h1>
          <motion.p
            variants={textItemVariants}
            className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            Produksi lokal dengan bahan premium, desain bebas revisi, dan workflow
            yang siap kebut B2B — dari futsal & football hingga esports & kampus.
          </motion.p>
        </motion.div>
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button asChild size="xl" className="group min-w-[14rem] shadow-[0_0_36px_-8px_rgba(158,255,0,0.45)]">
            <a
              href={getWhatsAppLink(
                `Halo ${site.name}, tim kami ingin konsultasi jersey custom.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              Konsultasi via WhatsApp
              <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="xl" className="group min-w-[12rem]">
            <Link href="/products" className="gap-2">
              Lihat Produk
              <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
