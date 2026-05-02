import Image from "next/image";
import Link from "next/link";

import { categories } from "@/lib/data/site";

export function CategoriesSection() {
  return (
    <section id="categories" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Kategori
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Fokus jersey.
            <span className="text-muted"> Siap skala lainnya.</span>
          </h2>
          <p className="mt-4 text-muted">
            Dari lapangan hingga ruang briefing — semua dengan DNA desain yang sama:
            tajam, kontras, dan siap branding.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-surface/60 transition-colors hover:border-brand/35"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-2xl text-foreground group-hover:text-brand">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
