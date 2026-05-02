import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/data/site";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <Card className="overflow-hidden border-white/10 transition-all duration-300 hover:border-brand/40 hover:shadow-[0_0_40px_-12px_rgba(158,255,0,0.35)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          <Badge className="absolute left-4 top-4">{product.category}</Badge>
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-lg tracking-wide text-foreground group-hover:text-brand">
            {product.name}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
