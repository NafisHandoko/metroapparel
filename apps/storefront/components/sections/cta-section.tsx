import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { site } from "@/lib/data/site";

export function CtaSection() {
  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 via-surface to-background px-6 py-16 sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Siap bikin jersey custom tim kamu?
            </h2>
            <p className="mt-4 text-muted">
              Ceritakan kebutuhan tim, deadline event, dan referensi desain — kami
              balas dengan opsi bahan & estimasi yang jelas.
            </p>
            <Button asChild size="xl" className="mt-8">
              <a
                href={getWhatsAppLink(
                  `Halo ${site.name}, kami siap diskusi jersey custom untuk tim.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Chat WhatsApp sekarang
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
