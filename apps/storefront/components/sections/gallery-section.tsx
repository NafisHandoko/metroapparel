"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { InfiniteMarquee } from "@/components/motion/infinite-marquee";
import { Reveal } from "@/components/motion/reveal";
import { useSiteContent } from "@/components/site-content-provider";
import { cn } from "@/lib/utils";

function GallerySlide({ src, index }: { src: string; index: number }) {
  return (
    <div
      className={cn(
        "group relative aspect-[4/5] w-[min(72vw,260px)] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface",
        "sm:w-64 md:w-72 lg:w-80",
      )}
    >
      <Image
        src={src}
        alt={`Galeri jersey ${index + 1}`}
        fill
        className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.06]"
        sizes="(max-width: 640px) 72vw, 320px"
      />
    </div>
  );
}

function GallerySegment({
  keySuffix,
  images,
}: {
  keySuffix: string;
  images: string[];
}) {
  return (
    <>
      {images.map((src, i) => (
        <GallerySlide key={`${src}-${keySuffix}-${i}`} src={src} index={i} />
      ))}
    </>
  );
}

export function GallerySection() {
  const { gallery: galleryImages } = useSiteContent();
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Di lapangan
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Beneran dipakai
            <span className="text-muted"> — bukan mockup doang.</span>
          </h2>
          <p className="mt-4 text-muted">
            Potret tim, event kampus, dan komunitas dengan Metro Apparel di studio kami.
          </p>
        </Reveal>

        {/* {!reduce ? (
          <p className="mt-8 text-center text-[11px] text-muted/80">
            Klik-tahan dan geser untuk menggeser galeri.
          </p>
        ) : null} */}

        <InfiniteMarquee
          reducedMotion={!!reduce}
          ariaLabel="Galeri foto lapangan, dapat diseret horizontal"
          viewportClassName={reduce ? "mt-10" : "mt-6 min-h-[min(72vw,360px)] sm:min-h-[22rem]"}
          renderSegment={(_, keySuffix) => (
            <GallerySegment keySuffix={keySuffix} images={galleryImages} />
          )}
        />
      </div>
    </section>
  );
}
