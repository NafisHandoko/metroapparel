"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { clientLogos } from "@/lib/data/site";
import { cn } from "@/lib/utils";

function LogoTile({ client }: { client: (typeof clientLogos)[number] }) {
  return (
    <div
      className={cn(
        "flex h-14 min-w-[7.5rem] shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 font-display text-sm tracking-wide",
        "text-muted grayscale transition-[filter,colors,border-color,transform,box-shadow] duration-500 ease-out",
        "hover:scale-[1.03] hover:border-brand/40 hover:text-foreground hover:grayscale-0 hover:shadow-[0_0_28px_-10px_rgba(158,255,0,0.35)]",
      )}
      title={client.name}
    >
      <span className="text-brand">{client.abbr}</span>
      <span className="ml-2 hidden text-[11px] uppercase sm:inline">
        {client.name}
      </span>
    </div>
  );
}

function LogoRow({ keySuffix }: { keySuffix: string }) {
  return (
    <>
      {clientLogos.map((client) => (
        <LogoTile key={`${client.name}-${keySuffix}`} client={client} />
      ))}
    </>
  );
}

const MAX_SEGMENTS = 18;

export function ClientsSection() {
  const reduce = useReducedMotion();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const copyARef = React.useRef<HTMLDivElement>(null);
  const copyBRef = React.useRef<HTMLDivElement>(null);
  const [loopPx, setLoopPx] = React.useState(0);
  const [segmentCount, setSegmentCount] = React.useState(2);

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
      // Cukup segmen agar track >= viewport + buffer, supaya tidak ada "lubang" di kanan
      const minSegments = Math.max(
        2,
        Math.min(MAX_SEGMENTS, Math.ceil(vw / loop) + 3),
      );
      setSegmentCount(minSegments);
    }
  }, []);

  React.useLayoutEffect(() => {
    if (reduce) return;
    const view = viewportRef.current;
    const track = trackRef.current;
    if (!view || !track) return;
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(view);
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure, reduce]);

  const durationSec =
    loopPx > 0 ? Math.max(24, Math.min(60, loopPx / 38)) : 0;

  if (reduce) {
    return (
      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-muted">
            Dipercaya organisasi & komunitas
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6">
            <LogoRow keySuffix="static" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-white/10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Dipercaya organisasi & komunitas
        </p>
        <div
          ref={viewportRef}
          className="relative mt-10 min-h-[3.5rem] overflow-hidden mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        >
          <div
            ref={trackRef}
            className={cn(
              "flex w-max gap-4 will-change-transform sm:gap-6",
              loopPx > 0 && "hover:[animation-play-state:paused]",
            )}
            style={
              loopPx > 0
                ? ({
                    ["--marquee-x" as string]: `${-loopPx}px`,
                    animation: `marquee-seamless ${durationSec}s linear infinite`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {Array.from({ length: segmentCount }, (_, i) => (
              <div
                key={i}
                ref={i === 0 ? copyARef : i === 1 ? copyBRef : undefined}
                className="flex shrink-0 gap-4 sm:gap-6"
                aria-hidden={i > 0}
              >
                <LogoRow keySuffix={`seg-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
