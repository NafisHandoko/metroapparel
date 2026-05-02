"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { categorySlugToName, type Product } from "@/lib/data/site";
import { cn } from "@/lib/utils";

const ALL = "Semua";

type ProductCategoryFilterProps = {
  products: Product[];
  initialCategorySlug?: string;
};

function initialActive(slug?: string): string {
  if (!slug) return ALL;
  const name = categorySlugToName[slug];
  return name ?? ALL;
}

export function ProductCategoryFilter({
  products,
  initialCategorySlug,
}: ProductCategoryFilterProps) {
  const [active, setActive] = useState<string>(() =>
    initialActive(initialCategorySlug),
  );

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return [ALL, ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    if (active === ALL) return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
              active === cat
                ? "border-brand bg-brand/15 text-brand shadow-[0_0_20px_-6px_rgba(158,255,0,0.5)]"
                : "border-white/15 text-muted hover:border-white/30 hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </div>
  );
}
