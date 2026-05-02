import Image from "next/image";

import { galleryImages } from "@/lib/data/site";

export function GallerySection() {
  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
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
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {galleryImages.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-surface lg:aspect-[3/4]"
            >
              <Image
                src={src}
                alt={`Galeri jersey ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
