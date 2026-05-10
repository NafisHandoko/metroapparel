import { CategoryCatalogView } from "@/components/product/category-catalog-view";
import { listMetroProducts } from "@/lib/medusa/products";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  return {
    title: `Toko Metro — ${content.company.name}`,
    description:
      "Training pants, jaket, short pants, polo, dan apparel Lotto/CVC — katalog Toko Metro.",
  };
}

export default async function TokoMetroCatalogPage() {
  const all = await listMetroProducts();
  const products = all.filter((p) => p.categorySlug === "toko-metro");

  return (
    <CategoryCatalogView
      products={products}
      title="Toko Metro"
      description="Apparel dan celana training, jaket, short pants, hingga polo bordir — siap dikustom atau dipilih varian standar lewat katalog di bawah."
      emptyCategoryHint="Belum ada produk Toko Metro dari Medusa. Pastikan backend jalan, publishable key di apps/storefront/.env, dan seed kategori toko-metro sudah dijalankan."
    />
  );
}
