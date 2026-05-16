import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text } from "@medusajs/ui";

type MetroBreakdownLine = { label: string; amount: number };

type OrderItemLike = {
  id?: string;
  product_title?: string | null;
  title?: string | null;
  variant_title?: string | null;
  quantity?: number;
  metadata?: Record<string, unknown> | null;
  /** Beberapa respons order menyimpan metadata di `detail`. */
  detail?: { metadata?: Record<string, unknown> | null } | null;
};

type OrderLike = {
  currency_code?: string | null;
  items?: OrderItemLike[];
};

function parseMetroBreakdown(raw: unknown): MetroBreakdownLine[] | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return null;
    const out: MetroBreakdownLine[] = [];
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      if (typeof o.label !== "string" || typeof o.amount !== "number") continue;
      if (Number.isNaN(o.amount)) continue;
      out.push({ label: o.label, amount: o.amount });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

function formatMoney(amount: number, currencyCode: string): string {
  const upper = currencyCode.toUpperCase();
  const cur = upper === "IDR" ? "IDR" : upper;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: cur === "IDR" ? 0 : 2,
  }).format(amount);
}

function getLineMetadata(item: OrderItemLike): Record<string, unknown> | null {
  if (item.metadata && typeof item.metadata === "object") {
    return item.metadata;
  }
  const d = item.detail?.metadata;
  if (d && typeof d === "object") {
    return d;
  }
  return null;
}

function isMetroLineItem(item: OrderItemLike): boolean {
  const m = getLineMetadata(item);
  if (!m) return false;
  return Boolean(
    m.metro_price_breakdown ||
      m.tier_id ||
      m.tier_name ||
      m.product_handle ||
      m.metro_order_mode,
  );
}

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

const OrderMetroDetailsWidget = ({ data }: { data: OrderLike }) => {
  const currency = (data?.currency_code ?? "idr").toString();
  const items = (data?.items ?? []).filter(isMetroLineItem);

  if (!items.length) {
    return null;
  }

  return (
    <Container className="divide-y p-0 rounded-lg border border-ui-border-base bg-ui-bg-base shadow-elevation-card-rest">
      <div className="px-6 py-4">
        <Heading level="h2" className="txt-compact-large font-sans font-medium">
          Konfigurasi Metro (dari pelanggan)
        </Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1 max-w-2xl">
          Ringkasan paket, olahraga / kegiatan (jersey custom), kerah, ukuran (satuan), tipe
          pemesanan (satuan / tim), catatan tim, add-on, dan rincian harga per baris pesanan. Data
          ini berasal dari checkout konfigurator.
        </Text>
      </div>

      <div className="flex flex-col">
        {items.map((item) => {
          const m = getLineMetadata(item) ?? {};
          const breakdown = parseMetroBreakdown(m.metro_price_breakdown);
          const productTitle =
            item.product_title ?? item.title ?? "Produk";
          const variantPart = item.variant_title?.trim();
          const qty = item.quantity ?? 1;

          const tierName = strMeta(m, "tier_name");
          const orderMode = strMeta(m, "metro_order_mode");
          const orderModeLabel =
            orderMode === "single"
              ? "Satuan"
              : orderMode === "team"
                ? "Tim / banyak"
                : null;
          const orderNotesTrim =
            typeof m.metro_order_notes === "string"
              ? m.metro_order_notes.trim()
              : "";
          const sizeRaw = strMeta(m, "size");
          const showSize =
            orderMode !== "team" && sizeRaw && sizeRaw !== "—" && sizeRaw !== "-";
          const collar = strMeta(m, "collar_label");
          const fabric = strMeta(m, "fabric_extra");
          const oversize = m.oversize === "yes";
          const upQtyRaw = m.up_size_qty;
          const upQty =
            typeof upQtyRaw === "string"
              ? Number.parseInt(upQtyRaw, 10) || 0
              : typeof upQtyRaw === "number"
                ? upQtyRaw
                : 0;
          const addonIds = parseAddonIds(m.addons_json);
          const jerseyPurpose = strMeta(m, "metro_jersey_purpose_label");

          return (
            <div key={item.id ?? productTitle} className="px-6 py-5 space-y-3">
              <div>
                <Text weight="plus" size="small" className="text-ui-fg-base">
                  {productTitle}
                  {variantPart ? ` · ${variantPart}` : ""}
                </Text>
                {qty > 1 ? (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Kuantitas item: {qty}
                  </Text>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ui-fg-subtle">
                {orderModeLabel ? (
                  <span>
                    <span className="text-ui-fg-muted">Tipe pemesanan:</span>{" "}
                    {orderModeLabel}
                  </span>
                ) : null}
                {orderMode === "team" ? (
                  <span className="min-w-0 basis-full">
                    <span className="text-ui-fg-muted">Catatan pelanggan:</span>
                    <span className="mt-1 block whitespace-pre-wrap break-words rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-2 text-ui-fg-base">
                      {orderNotesTrim || "(belum diisi)"}
                    </span>
                  </span>
                ) : null}
                {tierName ? (
                  <span>
                    <span className="text-ui-fg-muted">Paket:</span> {tierName}
                  </span>
                ) : null}
                {jerseyPurpose ? (
                  <span>
                    <span className="text-ui-fg-muted">Olahraga / kegiatan:</span>{" "}
                    {jerseyPurpose}
                  </span>
                ) : null}
                {showSize && sizeRaw ? (
                  <span>
                    <span className="text-ui-fg-muted">Ukuran:</span> {sizeRaw}
                  </span>
                ) : null}
                {collar ? (
                  <span>
                    <span className="text-ui-fg-muted">Kerah:</span> {collar}
                  </span>
                ) : null}
                {oversize ? (
                  <span>
                    <span className="text-ui-fg-muted">Oversize:</span> Ya
                  </span>
                ) : null}
                {fabric ? (
                  <span>
                    <span className="text-ui-fg-muted">Kain ekstra:</span>{" "}
                    {fabric}
                  </span>
                ) : null}
                {upQty > 0 ? (
                  <span>
                    <span className="text-ui-fg-muted">Up size:</span> {upQty}{" "}
                    kelipatan
                  </span>
                ) : null}
                {addonIds.length ? (
                  <span className="min-w-0 basis-full">
                    <span className="text-ui-fg-muted">Add-on:</span>{" "}
                    {addonIds.map((id) => id.replace(/-/g, " ")).join(", ")}
                  </span>
                ) : null}
              </div>

              {breakdown ? (
                <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-3">
                  <Text
                    size="xsmall"
                    weight="plus"
                    className="text-ui-fg-subtle uppercase tracking-wide mb-2"
                  >
                    Rincian harga baris
                  </Text>
                  <ul className="space-y-1.5">
                    {breakdown.map((line, idx) => (
                      <li
                        key={`${line.label}-${idx}`}
                        className="flex justify-between gap-4 text-sm text-ui-fg-base"
                      >
                        <span className="min-w-0 break-words">{line.label}</span>
                        <span className="shrink-0 tabular-nums font-medium">
                          {formatMoney(line.amount, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Text size="small" className="text-ui-fg-muted italic">
                  Tidak ada rincian harga tersimpan untuk baris ini.
                </Text>
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.before",
});

export default OrderMetroDetailsWidget;
