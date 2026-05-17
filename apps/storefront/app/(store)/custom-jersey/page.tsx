import { CategoryCatalogView } from "@/components/product/category-catalog-view";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { listMetroProducts } from "@/lib/medusa/products";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  const description = `Katalog jersey custom tim ${content.company.name}: jersey atasan dan satu set dengan paket Essential hingga Ultimate. Bahan premium, desain custom gratis, produksi cepat di Jombang.`;

  return {
    title: `Custom Jersey — ${content.company.name}`,
    description,
    alternates: {
      canonical: `${siteUrl}/custom-jersey`,
    },
    openGraph: {
      title: `Custom Jersey — ${content.company.name}`,
      description,
      url: `${siteUrl}/custom-jersey`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Custom Jersey — ${content.company.name}`,
      description,
    },
  };
}

export default async function CustomJerseyCatalogPage() {
  const all = await listMetroProducts();
  const products = all.filter((p) => p.categorySlug === "custom-jersey");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: siteUrl },
          { name: "Custom Jersey", url: `${siteUrl}/custom-jersey` },
        ]}
      />
      <CategoryCatalogView
        products={products}
        title="Custom Jersey"
        description="Siluet jersey tim dan komunitas: atasan saja atau set lengkap. Pilih paket, ukuran, kerah, dan add-on di halaman produk — ringkasan bisa lanjut ke WhatsApp."
        emptyCategoryHint="Belum ada produk Custom Jersey dari Medusa. Pastikan backend jalan, publishable key di apps/storefront/.env, dan seed kategori custom-jersey sudah dijalankan."
      />
    </>
  );
}
