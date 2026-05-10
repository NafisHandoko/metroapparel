"use client";

import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data/site";

type FeaturedProductsGridProps = {
  products: Product[];
};

export function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  return (
    <section id="featured" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Pilihan Tim
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Jersey & apparel yang lagi dicari
            </h2>
            <p className="mt-3 max-w-lg text-muted">
              Mulai dari paket custom jersey sampai polo dan jaket — lihat dulu yang paling sering dipesan tim dan komunitas.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="shrink-0">
            <Button asChild variant="outline">
              <Link href="/products">Semua produk</Link>
            </Button>
          </Reveal>
        </div>
        <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <RevealItem className="col-span-full">
              <p className="text-sm text-muted">
                Hubungkan storefront ke Medusa (publishable key + backend) untuk menampilkan
                produk unggulan di sini.
              </p>
            </RevealItem>
          ) : (
            products.map((product) => (
              <RevealItem key={product.handle}>
                <ProductCard product={product} />
              </RevealItem>
            ))
          )}
        </RevealStagger>
      </div>
    </section>
  );
}
