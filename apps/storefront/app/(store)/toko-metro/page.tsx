import { CategoryCatalogView } from "@/components/product/category-catalog-view";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { listMetroProducts } from "@/lib/medusa/products";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  const description = `Toko Metro ${content.company.name}: training pants, jaket tim, short pants, polo bordir, dan apparel berkualitas. Bahan Lotto & CVC premium, bisa custom di Jombang.`;

  return {
    title: `Toko Metro — ${content.company.name}`,
    description,
    alternates: {
      canonical: `${siteUrl}/toko-metro`,
    },
    openGraph: {
      title: `Toko Metro — ${content.company.name}`,
      description,
      url: `${siteUrl}/toko-metro`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Toko Metro — ${content.company.name}`,
      description,
    },
  };
}

export default async function TokoMetroCatalogPage() {
  const all = await listMetroProducts();
  const products = all.filter((p) => p.categorySlug === "toko-metro");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: siteUrl },
          { name: "Toko Metro", url: `${siteUrl}/toko-metro` },
        ]}
      />
      <CategoryCatalogView
        products={products}
        title="Toko Metro"
        description="Apparel dan celana training, jaket, short pants, hingga polo bordir — siap dikustom atau dipilih varian standar lewat katalog di bawah."
        emptyCategoryHint="Belum ada produk Toko Metro dari Medusa. Pastikan backend jalan, publishable key di apps/storefront/.env, dan seed kategori toko-metro sudah dijalankan."
      />
    </>
  );
}
