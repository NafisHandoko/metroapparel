import { testimonials } from "@/lib/data/site";

export function TestimonialsSection() {
  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Testimoni
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Suara dari garis depan
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
            >
              <p className="flex-1 text-sm leading-relaxed text-muted">
                &ldquo;{t.message}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/40 bg-brand/10 font-display text-sm text-brand"
                  aria-hidden
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
