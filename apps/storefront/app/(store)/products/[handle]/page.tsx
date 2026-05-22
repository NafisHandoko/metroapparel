import Link from "next/link";
import { notFound } from "next/navigation";

import { MedusaVariantConfigurator } from "@/components/product/medusa-variant-configurator";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { formatIdr } from "@/lib/data/catalog";
import { catalogListPathForCategory } from "@/lib/data/site";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import { getMetroAddonOptionsForProduct } from "@/lib/medusa/metro-addon-catalog";
import { getMetroCollarOptionsForProduct } from "@/lib/medusa/metro-collar-catalog";
import {
  getMetroProductByHandle,
  mapStoreProductToProduct,
} from "@/lib/medusa/products";
import { minMaxVariantPrices } from "@/lib/medusa/variant-picker";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const [raw, content] = await Promise.all([
    getMetroProductByHandle(handle),
    getResolvedSiteContent(),
  ]);
  if (!raw) return { title: "Produk" };

  const productUrl = `${siteUrl}/products/${handle}`;
  const productImage = raw.thumbnail ?? raw.images?.[0]?.url ?? `${siteUrl}/og-image.jpg`;
  const description = raw.description ?? `${raw.title} - Custom jersey & apparel dari ${content.company.name}`;

  return {
    title: `${raw.title} — ${content.company.name}`,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${raw.title} — ${content.company.name}`,
      description,
      url: productUrl,
      type: "website",
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: raw.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${raw.title} — ${content.company.name}`,
      description,
      images: [productImage],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params;
  const [raw, content] = await Promise.all([
    getMetroProductByHandle(handle),
    getResolvedSiteContent(),
  ]);
  if (!raw?.id || !raw.handle) notFound();
  const summary = mapStoreProductToProduct(raw);
  if (!summary) notFound();

  const [addonOptions, collarOptions] = await Promise.all([
    getMetroAddonOptionsForProduct(raw.id),
    getMetroCollarOptionsForProduct(raw.id),
  ]);

  const { min, max } = minMaxVariantPrices(raw.variants);
  const priceHint =
    min !== null && max !== null && max > min
      ? `${formatIdr(min)} – ${formatIdr(max)}`
      : min !== null
        ? formatIdr(min)
        : "Lihat varian";

  const productUrl = `${siteUrl}/products/${handle}`;
  const categoryName = summary.category;
  const categoryPath = catalogListPathForCategory(summary.categorySlug);

  return (
    <>
      <ProductJsonLd
        product={summary}
        companyName={content.company.name}
        fullUrl={productUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: siteUrl },
          { name: categoryName, url: `${siteUrl}${categoryPath}` },
          { name: summary.name, url: productUrl },
        ]}
      />
      <div className="border-b border-white/10 pb-20 pt-10 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={categoryPath}
            className="text-sm font-medium text-muted transition-colors hover:text-brand"
          >
            ← Kembali ke katalog
          </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductImageGallery
            images={
              raw.images?.length
                ? raw.images.map((img) => ({ id: img.id, url: img.url }))
                : [{ id: "fallback", url: summary.image }]
            }
            productName={summary.name}
          />
          <div className="flex flex-col justify-center">
            <Badge className="w-fit">{summary.category}</Badge>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {summary.name}
            </h1>
            {raw.subtitle ? (
              <p className="mt-2 text-sm font-medium text-muted">{raw.subtitle}</p>
            ) : null}
            <p className="mt-2 text-sm font-medium text-brand">Referensi: {priceHint}</p>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {summary.description}
            </p>
            <MedusaVariantConfigurator
              product={raw}
              addonOptions={addonOptions}
              collarOptions={collarOptions}
              categorySlug={summary.categorySlug}
            />
            <div className="mt-8">
              <Link
                href={catalogListPathForCategory(summary.categorySlug)}
                className="text-sm font-medium text-muted transition-colors hover:text-brand"
              >
                ← Lihat produk lain
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
