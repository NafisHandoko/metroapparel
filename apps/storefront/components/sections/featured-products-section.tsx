import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { listMetroProducts } from "@/lib/medusa/products";

export async function FeaturedProductsSection() {
  const products = await listMetroProducts();
  const featured = products.slice(0, 6);

  return (
    <section id="featured" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Produk unggulan
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Drop terbaru
            </h2>
            <p className="mt-3 max-w-lg text-muted">
              Kurasi siluet yang sering dipilih tim kompetitif dan komunitas besar.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Semua produk</Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length === 0 ? (
            <p className="col-span-full text-sm text-muted">
              Hubungkan storefront ke Medusa (publishable key + backend) untuk menampilkan
              produk unggulan di sini.
            </p>
          ) : (
            featured.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
