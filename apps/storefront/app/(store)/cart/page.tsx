import Link from "next/link";

import { CartLineRemove } from "@/components/cart/cart-line-remove";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/data/catalog";
import { site } from "@/lib/data/site";
import { retrieveMetroCart } from "@/lib/medusa/cart-server";
import type { Metadata } from "next";

function MetroLineBreakdown({
  metadata,
}: {
  metadata?: Record<string, unknown> | null;
}) {
  const raw = metadata?.metro_price_breakdown;
  if (typeof raw !== "string") return null;
  let lines: { label: string; amount: number }[] | null = null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      lines = parsed as { label: string; amount: number }[];
    }
  } catch {
    return null;
  }
  if (!lines) return null;
  return (
    <ul className="mt-2 max-w-md space-y-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted">
      {lines.map((l, i) => (
        <li key={i} className="flex justify-between gap-4">
          <span className="text-foreground/90">{l.label}</span>
          <span className="shrink-0 tabular-nums">{formatIdr(l.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

export const metadata: Metadata = {
  title: `Keranjang — ${site.name}`,
};

export default async function CartPage() {
  const cart = await retrieveMetroCart();

  if (!cart?.items?.length) {
    return (
      <div className="border-b border-white/10 pb-24 pt-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl tracking-tight text-foreground">Keranjang</h1>
          <p className="mt-4 text-muted">Belum ada barang. Jelajahi katalog atau lanjutkan via WhatsApp.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/products">Lihat produk</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Beranda</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0);

  return (
    <div className="border-b border-white/10 pb-24 pt-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Keranjang</h1>
        <p className="mt-2 text-sm text-muted">
          Harga baris memakai total Metro (paket + opsi) yang dihitung ulang di server dan masuk ke
          subtotal Medusa. Rincian add-on tampil di bawah setiap baris; admin dapat mengatur daftar
          add-on dan tipe kerah global lewat Medusa Admin → Settings → Metro add-on / Metro collars.
        </p>
        <ul className="mt-10 divide-y divide-white/10 border border-white/10 rounded-xl">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{item.title ?? item.product_title}</p>
                {item.variant?.sku ? (
                  <p className="mt-1 text-xs text-muted">SKU: {item.variant.sku}</p>
                ) : null}
                <MetroLineBreakdown metadata={item.metadata} />
                <p className="mt-2 text-sm text-brand">
                  {formatIdr(item.subtotal ?? 0)} · Qty {item.quantity}
                </p>
              </div>
              <CartLineRemove lineId={item.id} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl text-foreground">
            Subtotal <span className="text-brand">{formatIdr(subtotal)}</span>
          </p>
          <Button asChild size="lg">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
