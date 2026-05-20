"use client";

import { useState, useCallback } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";

type ProductImage = {
  id: string;
  url: string;
};

type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (!images.length) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface lg:aspect-[3/4]">
        <div className="flex h-full items-center justify-center text-muted">
          Tidak ada gambar
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface lg:aspect-[3/4]">
        <OptimizedImage
          src={activeImage.url}
          alt={`${productName} - Gambar ${activeIndex + 1}`}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all hover:border-brand hover:bg-background hover:text-brand group-hover:opacity-100"
              aria-label="Gambar sebelumnya"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all hover:border-brand hover:bg-background hover:text-brand group-hover:opacity-100"
              aria-label="Gambar berikutnya"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                index === activeIndex
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-white/10 hover:border-white/30",
              )}
              aria-label={`Lihat gambar ${index + 1}`}
            >
              <OptimizedImage
                src={img.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
