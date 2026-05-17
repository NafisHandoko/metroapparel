"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIdr } from "@/lib/data/catalog";
import type { Product } from "@/lib/data/site";
import { useIsMobile } from "@/lib/hooks/use-mobile";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;
  const from =
    product.minPriceIdr !== null ? formatIdr(product.minPriceIdr) : "—";

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <motion.div
        className="h-full"
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        <Card className="h-full overflow-hidden border-white/10 transition-[box-shadow,border-color] duration-500 hover:border-brand/45 hover:shadow-[0_20px_48px_-16px_rgba(158,255,0,0.28)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            <Badge className="absolute left-4 top-4">{product.category}</Badge>
            <span className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 rounded-md border border-brand/40 bg-background/85 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-brand opacity-0 shadow-[0_0_24px_-8px_rgba(158,255,0,0.45)] backdrop-blur-md transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              Lihat detail
            </span>
          </div>
          <CardContent className="p-5">
            <h3 className="font-display text-lg tracking-wide text-foreground transition-colors duration-300 group-hover:text-brand">
              {product.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-brand">
              {product.minPriceIdr !== null ? `Mulai ${from}` : "Lihat varian & harga"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
