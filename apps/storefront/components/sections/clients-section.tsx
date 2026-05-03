import { clientLogos } from "@/lib/data/site";

export function ClientsSection() {
  return (
    <section className="border-t border-white/10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Dipercaya organisasi & komunitas
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {clientLogos.map((client) => (
            <div
              key={client.name}
              className="flex h-14 min-w-[7rem] items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 font-display text-sm tracking-wide text-muted transition-colors hover:border-brand/30 hover:text-foreground"
              title={client.name}
            >
              <span className="text-brand">{client.abbr}</span>
              <span className="ml-2 hidden text-[11px] uppercase sm:inline">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
