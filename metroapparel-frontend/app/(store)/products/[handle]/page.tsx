import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductByHandle, products, site } from "@/lib/data/site";
import { getWhatsAppLink } from "@/lib/whatsapp";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) return { title: "Produk" };
  return {
    title: `${product.name} — ${site.name}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) notFound();

  const wa = getWhatsAppLink(
    `Halo ${site.name}, saya tertarik dengan produk "${product.name}" (${handle}). Mohon info harga & MOQ.`,
  );

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
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              {product.description}
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li className="flex gap-2">
                <span className="text-brand">—</span>
                Sublimasi / bordir sesuai kebutuhan branding
              </li>
              <li className="flex gap-2">
                <span className="text-brand">—</span>
                Size run lengkap untuk tim & institusi
              </li>
              <li className="flex gap-2">
                <span className="text-brand">—</span>
                Mockup & revisi desain termasuk konsultasi awal
              </li>
            </ul>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="xl">
                <a href={wa} target="_blank" rel="noreferrer">
                  Pesan via WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="/products">Lihat produk lain</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
