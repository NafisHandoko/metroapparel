import { CategoryCatalogView } from "@/components/product/category-catalog-view";
import { listMetroProducts } from "@/lib/medusa/products";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  return {
    title: `Custom Jersey — ${content.company.name}`,
    description:
      "Jersey atasan dan jersey satu set — paket Essential hingga Ultimate, konfigurasi di toko.",
  };
}

export default async function CustomJerseyCatalogPage() {
  const all = await listMetroProducts();
  const products = all.filter((p) => p.categorySlug === "custom-jersey");

  return (
    <CategoryCatalogView
      products={products}
      title="Custom Jersey"
      description="Siluet jersey tim dan komunitas: atasan saja atau set lengkap. Pilih paket, ukuran, kerah, dan add-on di halaman produk — ringkasan bisa lanjut ke WhatsApp."
      emptyCategoryHint="Belum ada produk Custom Jersey dari Medusa. Pastikan backend jalan, publishable key di apps/storefront/.env, dan seed kategori custom-jersey sudah dijalankan."
    />
  );
}
