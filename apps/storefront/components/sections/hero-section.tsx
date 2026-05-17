"use client";

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
import { useSiteContent } from "@/components/site-content-provider";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { useIsMobile } from "@/lib/hooks/use-mobile";

/** Durasi zoom-in halus per slide (ms). */
const HERO_ZOOM_MS = 8200;
/** Jeda total antar pergantian slide = zoom + sedikit hold sebelum crossfade berikutnya. */
const HERO_SLIDE_INTERVAL_MS = HERO_ZOOM_MS + 600;
/** Durasi crossfade (detik) — dipakai Framer + timeout outgoing layer. */
const HERO_CROSSFADE_SEC = 0.75;

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
  const { company, heroBackgroundUrls } = useSiteContent();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;
  /** Lapisan bawah = slide saat ini; lapisan atas memudar menampilkan slide berikutnya (dua lapisan — loop tanpa jeda hitam). */
  const [bottomIndex, setBottomIndex] = React.useState(0);
  const [overlayVisible, setOverlayVisible] = React.useState(false);

  const rotationImages = React.useMemo(() => {
    return (heroBackgroundUrls ?? [])
      .map((u) => (typeof u === "string" ? u.trim() : ""))
      .filter(Boolean);
  }, [heroBackgroundUrls]);

  const rotationKey = rotationImages.join("\u0000");
  const heroCount = rotationImages.length;
  const hasHeroImages = heroCount > 0;
  const nextIndex = hasHeroImages ? (bottomIndex + 1) % heroCount : 0;

  React.useEffect(() => {
    setBottomIndex(0);
    setOverlayVisible(false);
  }, [rotationKey]);

  React.useEffect(() => {
    if (reduce || !hasHeroImages) return;
    for (const src of rotationImages) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    }
  }, [reduce, hasHeroImages, rotationImages]);

  React.useEffect(() => {
    if (reduce || heroCount < 2) return;
    let cancelled = false;
    void (async () => {
      while (!cancelled) {
        await new Promise<void>((r) => {
          window.setTimeout(r, HERO_SLIDE_INTERVAL_MS);
        });
        if (cancelled) break;
        setOverlayVisible(true);
        await new Promise<void>((r) => {
          window.setTimeout(r, HERO_CROSSFADE_SEC * 1000);
        });
        if (cancelled) break;
        setBottomIndex((i) => (i + 1) % heroCount);
        setOverlayVisible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reduce, heroCount, rotationKey]);

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
        <div className="relative h-full min-h-[85vh] w-full bg-black">
          {hasHeroImages ? (
            reduce ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- URL dari admin (domain bebas). */}
                <img
                  src={rotationImages[0]}
                  alt="Tim dengan jersey custom"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  decoding="async"
                  fetchPriority="high"
                />
              </>
            ) : (
              <div className="absolute inset-0">
                <motion.div
                  key={`hero-bottom-${bottomIndex}`}
                  className="absolute inset-0 z-[1] overflow-hidden will-change-transform"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.12 }}
                  transition={{
                    duration: HERO_ZOOM_MS / 1000,
                    ease: [0.22, 0.06, 0.36, 1],
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL dari admin (domain bebas). */}
                  <img
                    src={rotationImages[bottomIndex]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    decoding="async"
                    fetchPriority={bottomIndex === 0 ? "high" : "auto"}
                  />
                </motion.div>
                {heroCount >= 2 ? (
                  <motion.div
                    className="pointer-events-none absolute inset-0 z-[2] overflow-hidden will-change-opacity"
                    initial={false}
                    animate={{ opacity: overlayVisible ? 1 : 0 }}
                    transition={{
                      duration: overlayVisible ? HERO_CROSSFADE_SEC : 0,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- URL dari admin (domain bebas). */}
                    <img
                      src={rotationImages[nextIndex]}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      decoding="async"
                      fetchPriority="auto"
                    />
                  </motion.div>
                ) : null}
              </div>
            )
          ) : null}
        </div>
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
      {!isMobile && (
        <>
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
        </>
      )}

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
            Jersey tim · Sekolah · Komunitas · Event
          </motion.p>
          <motion.h1
            variants={textItemVariants}
            className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-7xl"
          >
            PEDE DI LAPANGAN
            <span className="mt-1 block text-brand drop-shadow-[0_0_28px_rgba(158,255,0,0.35)]">
              MULAI DARI JERSEY-NYA
            </span>
          </motion.h1>
          <motion.p
            variants={textItemVariants}
            className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            Mau jersey buat futsal sekolah, turnamen bareng komunitas, atau acara kampus? Bahan enak dipakai, desain bisa kamu utak-atik bareng kami — produksi di Kota Jombang.
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
                `Halo ${company.name}, tim kami ingin konsultasi jersey custom.`,
                company.whatsappDigits,
              )}
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              Chat dulu di WhatsApp
              <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="xl" className="group min-w-[12rem]">
            <Link href="/custom-jersey" className="gap-2">
              Lihat Produk
              <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
