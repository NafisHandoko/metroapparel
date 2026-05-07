"use client";

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

export function ClientsSection() {
  const row = [...clientLogos, ...clientLogos];

  return (
    <section className="border-t border-white/10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Dipercaya organisasi & komunitas
        </p>
        <div className="relative mt-10 overflow-hidden mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused] sm:gap-6 motion-reduce:animate-none">
            {row.map((client, i) => (
              <LogoTile key={`${client.name}-${i}`} client={client} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
