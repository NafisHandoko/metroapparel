import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/data/site";

type CategoryCatalogViewProps = {
  products: Product[];
  title: string;
  description: string;
  eyebrow?: string;
  emptyCategoryHint: string;
};

export function CategoryCatalogView({
  products,
  title,
  description,
  eyebrow = "Katalog",
  emptyCategoryHint,
}: CategoryCatalogViewProps) {
  return (
    <div className="border-b border-white/10 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-muted">{description}</p>
        {products.length === 0 ? (
          <p className="mt-12 max-w-xl text-muted">{emptyCategoryHint}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
