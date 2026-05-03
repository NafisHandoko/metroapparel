import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { site } from "@/lib/data/site";

const heroImage =
  "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=1920&q=85";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <Image
        src={heroImage}
        alt="Tim dengan jersey custom"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-end gap-8 px-4 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
            Custom apparel · Tim · Komunitas · Institusi
          </p>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            JERSEY CUSTOM
            <span className="block text-brand drop-shadow-[0_0_28px_rgba(158,255,0,0.35)]">
              TANPA KOMPROMI
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Produksi lokal dengan bahan premium, desain bebas revisi, dan workflow
            yang siap kebut B2B — dari futsal & football hingga esports & kampus.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild size="xl">
            <a
              href={getWhatsAppLink(
                `Halo ${site.name}, tim kami ingin konsultasi jersey custom.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              Konsultasi via WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/products">Lihat Produk</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
