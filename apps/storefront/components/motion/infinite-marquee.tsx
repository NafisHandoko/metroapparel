"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const MARQUEE_MAX_SEGMENTS = 18;

export function wrapMarqueePos(p: number, loop: number) {
  let x = p;
  while (x <= -loop) x += loop;
  while (x > 0) x -= loop;
  return x;
}

type InfiniteMarqueeProps = {
  reducedMotion: boolean;
  /** Satu segmen berulang; `keySuffix` unik per segmen untuk key React */
  renderSegment: (segmentIndex: number, keySuffix: string) => React.ReactNode;
  ariaLabel: string;
  viewportClassName?: string;
  trackClassName?: string;
};

export function InfiniteMarquee({
  reducedMotion,
  renderSegment,
  ariaLabel,
  viewportClassName,
  trackClassName,
}: InfiniteMarqueeProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const copyARef = React.useRef<HTMLDivElement>(null);
  const copyBRef = React.useRef<HTMLDivElement>(null);
  const [loopPx, setLoopPx] = React.useState(0);
  const [segmentCount, setSegmentCount] = React.useState(2);

  const posRef = React.useRef(0);
  const draggingRef = React.useRef(false);
  const lastClientXRef = React.useRef(0);
  const rafRef = React.useRef(0);

  const measure = React.useCallback(() => {
    const a = copyARef.current;
    const b = copyBRef.current;
    const view = viewportRef.current;
    if (!a || !b) return;
    const loop = Math.round(b.offsetLeft - a.offsetLeft);
    if (loop <= 0) return;
    setLoopPx(loop);

    if (view) {
      const vw = view.clientWidth;
      const minSegments = Math.max(
        2,
        Math.min(MARQUEE_MAX_SEGMENTS, Math.ceil(vw / loop) + 3),
      );
      setSegmentCount(minSegments);
    }
  }, []);

  React.useLayoutEffect(() => {
    if (reducedMotion) return;
    const view = viewportRef.current;
    const track = trackRef.current;
    if (!view || !track) return;
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(view);
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure, reducedMotion]);

  const durationSec =
    loopPx > 0 ? Math.max(24, Math.min(60, loopPx / 38)) : 0;

  const applyTransform = React.useCallback((x: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px,0,0)`;
  }, []);

  React.useEffect(() => {
    if (reducedMotion || loopPx <= 0 || durationSec <= 0) return;

    let stopped = false;
    const velocityPxPerSec = -loopPx / durationSec;
    let last = performance.now();

    const tick = (now: number) => {
      if (stopped) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (!draggingRef.current) {
        let p = posRef.current + velocityPxPerSec * dt;
        p = wrapMarqueePos(p, loopPx);
        posRef.current = p;
        applyTransform(p);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [applyTransform, durationSec, loopPx, reducedMotion]);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || loopPx <= 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      lastClientXRef.current = e.clientX;
    },
    [loopPx],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || loopPx <= 0) return;
      const dx = e.clientX - lastClientXRef.current;
      lastClientXRef.current = e.clientX;
      const p = wrapMarqueePos(posRef.current + dx, loopPx);
      posRef.current = p;
      applyTransform(p);
    },
    [applyTransform, loopPx],
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    },
    [],
  );

  if (reducedMotion) {
    return (
      <div
        className={cn(
          "flex flex-wrap justify-center gap-4 sm:gap-6",
          viewportClassName,
        )}
      >
        {renderSegment(0, "static")}
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative overflow-hidden select-none touch-none",
        "mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        loopPx > 0 && "cursor-grab active:cursor-grabbing",
        viewportClassName,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex w-max gap-4 will-change-transform sm:gap-6",
          trackClassName,
        )}
      >
        {Array.from({ length: segmentCount }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? copyARef : i === 1 ? copyBRef : undefined}
            className="flex shrink-0 gap-4 sm:gap-6"
            aria-hidden={i > 0}
          >
            {renderSegment(i, `seg-${i}`)}
          </div>
        ))}
      </div>
    </div>
  );
}
