import { FeaturedProductsGrid } from "@/components/sections/featured-products-grid";
import { listMetroProducts } from "@/lib/medusa/products";

export async function FeaturedProductsSection() {
  const products = await listMetroProducts();
  const featured = products.slice(0, 6);

  return <FeaturedProductsGrid products={featured} />;
}
