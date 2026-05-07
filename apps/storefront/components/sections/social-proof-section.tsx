"use client";

import { RevealItem, RevealStagger } from "@/components/motion/reveal";
import { stats } from "@/lib/data/site";

export function SocialProofSection() {
  return (
    <section className="border-y border-white/10 bg-surface/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealStagger className="grid gap-8 sm:grid-cols-3">
          {stats.map((item) => (
            <RevealItem key={item.label}>
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="font-display text-4xl text-brand sm:text-5xl">
                  {item.value}
                </span>
                <span className="mt-2 max-w-[14rem] text-sm leading-relaxed text-muted">
                  {item.label}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
