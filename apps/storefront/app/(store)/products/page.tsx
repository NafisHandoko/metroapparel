import { ProductCategoryFilter } from "@/components/product/product-category-filter";
import { categorySlugToName, site } from "@/lib/data/site";
import { listMetroProducts } from "@/lib/medusa/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Produk — ${site.name}`,
  description: "Katalog jersey, PDH, polo, dan jaket custom Metro Apparel.",
};

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category: categorySlug } = await searchParams;
  const initialCategorySlug =
    categorySlug && categorySlugToName[categorySlug]
      ? categorySlug
      : undefined;

  const products = await listMetroProducts();

  return (
    <div className="border-b border-white/10 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
          Katalog
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Produk custom
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Pilih kategori untuk menyaring siluet. Semua varian bisa dikonsultasikan
          via WhatsApp untuk penyesuaian warna, logo sponsor, dan MOQ.
        </p>
        {products.length === 0 ? (
          <p className="mt-12 max-w-xl text-muted">
            Tidak ada produk dari Medusa. Jalankan backend, set{" "}
            <code className="text-foreground">NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY</code>{" "}
            di <code className="text-foreground">apps/storefront/.env</code>, lalu seed
            database (
            <code className="text-foreground">pnpm backend:seed</code> dari root monorepo).
          </p>
        ) : (
          <div className="mt-12">
            <ProductCategoryFilter
              products={products}
              initialCategorySlug={initialCategorySlug}
            />
          </div>
        )}
      </div>
    </div>
  );
}
