import Link from "next/link";

import { CartLineRemove } from "@/components/cart/cart-line-remove";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/data/catalog";
import { site } from "@/lib/data/site";
import { retrieveMetroCart } from "@/lib/medusa/cart-server";
import type { Metadata } from "next";

function strMeta(m: Record<string, unknown>, key: string): string | undefined {
  const v = m[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

function parseAddonIds(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

/** Ringkasan konfigurasi Metro (metadata baris), di atas rincian harga. */
function MetroLineConfigSummary({
  metadata,
}: {
  metadata?: Record<string, unknown> | null;
}) {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const hasMetro =
    typeof m.metro_price_breakdown === "string" ||
    strMeta(m, "product_handle") ||
    strMeta(m, "tier_name");
  if (!hasMetro) return null;

  const tier = strMeta(m, "tier_name");
  const size = strMeta(m, "size");
  const collar = strMeta(m, "collar_label");
  const fabric = strMeta(m, "fabric_extra");
  const oversize = m.oversize === "yes";
  const upRaw = m.up_size_qty;
  const upQty =
    typeof upRaw === "string"
      ? Number.parseInt(upRaw, 10) || 0
      : typeof upRaw === "number"
        ? upRaw
        : 0;
  const addonIds = parseAddonIds(m.addons_json);

  const rows: { label: string; value: string }[] = [];
  if (tier) rows.push({ label: "Paket", value: tier });
  if (size) rows.push({ label: "Ukuran", value: size });
  if (collar) rows.push({ label: "Kerah", value: collar });
  if (oversize) rows.push({ label: "Oversize", value: "Ya" });
  if (fabric) rows.push({ label: "Kain ekstra", value: fabric });
  if (upQty > 0) rows.push({ label: "Up size", value: `${upQty} kelipatan` });
  if (addonIds.length) {
    rows.push({
      label: "Add-on",
      value: addonIds.map((id) => id.replace(/-/g, " ")).join(", "),
    });
  }

  if (!rows.length) return null;

  return (
    <dl className="mt-2 max-w-md space-y-1 text-xs text-muted">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="shrink-0 text-foreground/70">{r.label}:</dt>
          <dd className="min-w-0 text-foreground/90">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

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
          Harga baris = total Metro (varian Medusa + kerah, oversize, add-on, dll.) yang dihitung di
          server. Rincian per baris tampil di bawah bila tersedia (
          <code className="text-foreground/90">metro_price_breakdown</code>).
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
                <MetroLineConfigSummary metadata={item.metadata} />
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
