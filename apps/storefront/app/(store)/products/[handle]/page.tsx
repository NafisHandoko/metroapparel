import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductConfigurator } from "@/components/product/product-configurator";
import { Badge } from "@/components/ui/badge";
import { formatIdr, minPriceForKind, tiersForKind } from "@/lib/data/catalog";
import { site } from "@/lib/data/site";
import {
  getMetroProductByHandle,
  getMetroProductSummaryByHandle,
} from "@/lib/medusa/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const raw = await getMetroProductByHandle(handle);
  if (!raw) return { title: "Produk" };
  return {
    title: `${raw.title} — ${site.name}`,
    description: raw.description ?? raw.title,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getMetroProductSummaryByHandle(handle);
  if (!product) notFound();

  const tierCount = tiersForKind(product.kind).length;
  const priceHint =
    tierCount > 1
      ? `${formatIdr(minPriceForKind(product.kind))} – lihat paket di bawah`
      : formatIdr(minPriceForKind(product.kind));

  return (
    <div className="border-b border-white/10 pb-20 pt-10 sm:pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="text-sm font-medium text-muted transition-colors hover:text-brand"
        >
          ← Kembali ke katalog
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface lg:aspect-[3/4]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
          <div className="flex flex-col justify-center">
            <Badge className="w-fit">{product.category}</Badge>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm font-medium text-brand">Referensi: {priceHint}</p>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {product.description}
            </p>
            <p className="mt-6 text-sm text-muted">
              Pilih paket, ukuran (S–XXXL), opsi oversize, kerah (untuk jersey), dan
              add-on — lalu kirim ringkasan ke WhatsApp untuk konfirmasi admin. Harga
              dasar per paket & ukuran tersinkron dari Medusa; kerah, oversize, dan
              add-on dihitung di bawah seperti pricelist workshop.
            </p>
            <ProductConfigurator
              productName={product.name}
              productHandle={product.handle}
              kind={product.kind}
            />
            <div className="mt-8">
              <Link
                href="/products"
                className="text-sm font-medium text-muted transition-colors hover:text-brand"
              >
                ← Lihat produk lain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
