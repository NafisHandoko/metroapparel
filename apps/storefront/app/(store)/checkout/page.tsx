import Link from "next/link";
import { redirect } from "next/navigation";

import { MetroCheckoutForm } from "@/components/checkout/metro-checkout-form";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { retrieveMetroCart } from "@/lib/medusa/cart-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Checkout — ${site.name}`,
};

export default async function CheckoutPage() {
  const cart = await retrieveMetroCart();
  if (!cart?.items?.length) {
    redirect("/cart");
  }

  return (
    <div className="border-b border-white/10 pb-24 pt-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="text-sm font-medium text-muted transition-colors hover:text-brand"
        >
          ← Kembali ke keranjang
        </Link>
        <h1 className="mt-6 font-display text-3xl tracking-tight text-foreground">Checkout</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Hybrid: pesanan masuk ke Medusa Admin seperti toko standar. Anda tetap bisa chat produk &
          revisi lewat WhatsApp kapan saja.
        </p>
        <div className="mt-10 rounded-xl border border-white/10 bg-surface/50 p-6 sm:p-8">
          <MetroCheckoutForm />
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/cart">Batal — ubah keranjang</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
