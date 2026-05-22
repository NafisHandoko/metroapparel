import { FeaturedProductsGrid } from "@/components/sections/featured-products-grid";
import { listProductsByCollectionHandle } from "@/lib/medusa/products";

/**
 * Handle collection di Medusa Admin yang digunakan untuk Featured Products.
 * Admin cukup menambahkan produk ke collection ini untuk menampilkannya di beranda.
 */
const FEATURED_COLLECTION_HANDLE = "featured-products";

export async function FeaturedProductsSection() {
  const products = await listProductsByCollectionHandle(
    FEATURED_COLLECTION_HANDLE,
  );

  // Jika collection kosong atau tidak ada, jangan tampilkan section
  if (products.length === 0) {
    return null;
  }

  return <FeaturedProductsGrid products={products} />;
}
