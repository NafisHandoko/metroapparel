import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { retrieveMetroCart } from "@/lib/medusa/cart-server";

export async function SiteHeader() {
  const cart = await retrieveMetroCart();
  const itemCount =
    cart?.items?.reduce((sum, line) => sum + (line.quantity ?? 0), 0) ?? 0;

  return <SiteHeaderClient itemCount={itemCount} />;
}
