"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

type ZoomState = {
  isZooming: boolean;
  x: number;
  y: number;
};

function useImageZoom() {
  const [zoom, setZoom] = useState<ZoomState>({ isZooming: false, x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoom({ isZooming: true, x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setZoom((prev) => ({ ...prev, isZooming: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setZoom({ isZooming: false, x: 50, y: 50 });
  }, []);

  return {
    containerRef,
    zoom,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
}

function useDragScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      hasMoved.current = false;
      container.classList.add("cursor-grabbing");
      container.classList.remove("cursor-grab");
      startX.current = e.pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      container.classList.remove("cursor-grabbing");
      container.classList.add("cursor-grab");
    };

    const onMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        container.classList.remove("cursor-grabbing");
        container.classList.add("cursor-grab");
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const x = e.pageX - container.offsetLeft;
      const walk = x - startX.current;
      if (Math.abs(walk) > 3) {
        hasMoved.current = true;
        e.preventDefault();
        container.scrollLeft = scrollLeft.current - walk * 1.5;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (hasMoved.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick, true);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onClick, true);
    };
  }, []);

  return containerRef;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailContainerRef = useDragScroll();
  const {
    containerRef: zoomContainerRef,
    zoom,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useImageZoom();

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

  const zoomScale = 1.5;

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full">
      <div
        ref={zoomContainerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface lg:aspect-[3/4] cursor-zoom-in"
      >
        <OptimizedImage
          src={activeImage.url}
          alt={`${productName} - Gambar ${activeIndex + 1}`}
          fill
          priority
          className={cn(
            "object-cover transition-transform duration-200 ease-out",
            zoom.isZooming && "duration-0"
          )}
          style={
            zoom.isZooming
              ? {
                  transform: `scale(${zoomScale})`,
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                }
              : undefined
          }
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent transition-opacity duration-200",
            zoom.isZooming && "opacity-0"
          )}
        />

        {hasMultipleImages && !zoom.isZooming ? (
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
        <div
          ref={thumbnailContainerRef}
          className={cn(
            "flex gap-2 overflow-x-auto pb-2 cursor-grab select-none",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30",
            "[&::-webkit-scrollbar]:h-1",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-white/15",
            "[&:hover::-webkit-scrollbar-thumb]:bg-white/25",
          )}
        >
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
                className="object-cover pointer-events-none"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
