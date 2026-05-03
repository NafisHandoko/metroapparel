import { whyUs } from "@/lib/data/site";

export function WhyUsSection() {
  return (
    <section id="why" className="scroll-mt-24 border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Kenapa Metro
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Built for teams
              <span className="block text-muted">that move fast.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted lg:text-right">
            Kami bukan template SaaS — setiap batch apparel dikerjakan dengan
            kontrol kualitas manual dan komunikasi langsung dengan tim produksi.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6"
            >
              <div className="mb-4 h-px w-10 bg-brand shadow-[0_0_12px_rgba(158,255,0,0.5)]" />
              <h3 className="font-display text-xl text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
