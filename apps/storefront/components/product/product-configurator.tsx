"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { addConfiguratorToCartAction } from "@/app/actions/metro-cart";
import { Button } from "@/components/ui/button";
import {
  additionalOptions,
  collarOptions,
  formatIdr,
  oversizeSurcharge,
  showCollarPicker,
  sizeOptions,
  tiersForKind,
  type ProductKind,
  type SizeOption,
} from "@/lib/data/catalog";
import { site } from "@/lib/data/site";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type ProductConfiguratorProps = {
  productName: string;
  productHandle: string;
  kind: ProductKind;
};

export function ProductConfigurator({
  productName,
  productHandle,
  kind,
}: ProductConfiguratorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cartError, setCartError] = useState<string | null>(null);

  const checkoutEnabled =
    typeof process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY === "string" &&
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.length > 0;

  const tiers = tiersForKind(kind);
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [collarId, setCollarId] = useState(collarOptions[0]?.id ?? "o-neck");
  const [size, setSize] = useState<SizeOption>("M");
  const [oversize, setOversize] = useState(false);
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});
  const [upSizeQty, setUpSizeQty] = useState(0);
  const [fabricExtra, setFabricExtra] = useState<"emboss" | "jacquard" | null>(
    null,
  );

  const ultimateIncludes3d = kind === "jersey-set" && tierId === "ultimate";
  useEffect(() => {
    if (ultimateIncludes3d) {
      setAddOns((prev) => ({ ...prev, "3d-logo": false }));
    }
  }, [ultimateIncludes3d]);

  const tier = tiers.find((t) => t.id === tierId);
  const collar = collarOptions.find((c) => c.id === collarId);
  const collarExtra = showCollarPicker(kind) ? (collar?.surcharge ?? 0) : 0;
  const total = useMemo(() => {
    if (!tier) return 0;
    let sum = tier.price + collarExtra;
    if (oversize) sum += oversizeSurcharge;
    sum += upSizeQty * 10_000;
    if (fabricExtra === "emboss") sum += 10_000;
    if (fabricExtra === "jacquard") sum += 15_000;

    for (const opt of additionalOptions) {
      if (opt.group === "fabric-extra") continue;
      if (opt.input === "quantity") continue;
      if (opt.id === "3d-logo" && ultimateIncludes3d) continue;
      if (addOns[opt.id]) sum += opt.price;
    }
    return sum;
  }, [tier, collarExtra, oversize, upSizeQty, fabricExtra, addOns, ultimateIncludes3d]);

  function toggleAddOn(id: string) {
    setAddOns((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const waMessage = useMemo(() => {
    const lines = [
      `Halo ${site.name},`,
      `Saya ingin pesan: *${productName}* (/products/${productHandle})`,
      tier ? `Paket: *${tier.name}* (${formatIdr(tier.price)})` : "",
      showCollarPicker(kind) && collar
        ? `Kerah: *${collar.label}*${collar.surcharge ? ` (+${formatIdr(collar.surcharge)})` : ""}`
        : "",
      `Ukuran: *${size}*${oversize ? " + *Oversize*" : ""}`,
      upSizeQty > 0 ? `Up size: *${upSizeQty}* kelipatan (+${formatIdr(upSizeQty * 10_000)})` : "",
      fabricExtra ? `Kain extra: *${fabricExtra}*` : "",
    ];
    const addLines = additionalOptions
      .filter(
        (o) =>
          !o.group &&
          o.input !== "quantity" &&
          addOns[o.id] &&
          !(o.id === "3d-logo" && ultimateIncludes3d),
      )
      .map((o) => `Add-on: ${o.label} (${o.price >= 0 ? "+" : ""}${formatIdr(o.price)})`);
    lines.push(...addLines);
    lines.push("", `Perkiraan subtotal (estimasi): *${formatIdr(total)}*`);
    lines.push("Mohon konfirmasi MOQ, revisi desain, dan jadwal produksi. Terima kasih!");
    return lines.filter(Boolean).join("\n");
  }, [
    productName,
    productHandle,
    tier,
    collar,
    kind,
    size,
    oversize,
    upSizeQty,
    fabricExtra,
    addOns,
    total,
    ultimateIncludes3d,
  ]);

  const waHref = getWhatsAppLink(waMessage);

  function buildLineMetadata(): Record<string, string> {
    const addonIds = additionalOptions
      .filter(
        (o) =>
          !o.group &&
          o.input !== "quantity" &&
          addOns[o.id] &&
          !(o.id === "3d-logo" && ultimateIncludes3d),
      )
      .map((o) => o.id);
    return {
      product_name: productName,
      product_handle: productHandle,
      tier_id: tierId,
      tier_name: tier?.name ?? "",
      size,
      oversize: oversize ? "yes" : "no",
      collar_id: showCollarPicker(kind) ? collarId : "",
      collar_label: showCollarPicker(kind) ? (collar?.label ?? "") : "",
      fabric_extra: fabricExtra ?? "",
      up_size_qty: String(upSizeQty),
      addons_json: JSON.stringify(addonIds),
      estimated_total_idr: String(total),
    };
  }

  function addToWebsiteCart() {
    if (!tier) return;
    setCartError(null);
    startTransition(async () => {
      const res = await addConfiguratorToCartAction({
        productHandle,
        tierId,
        size,
        metadata: buildLineMetadata(),
      });
      if (res.ok) {
        router.push("/cart");
        router.refresh();
        return;
      }
      setCartError(res.message);
    });
  }

  return (
    <div className="mt-10 space-y-10 border-t border-white/10 pt-10">
      <div>
        <h2 className="font-display text-xl tracking-wide text-foreground">
          Paket & harga
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pilih paket resmi. Harga per daftar klien — final mengikuti konfirmasi
          admin.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTierId(t.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                tierId === t.id
                  ? "border-brand bg-brand/10 shadow-[0_0_24px_-8px_rgba(158,255,0,0.4)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-lg text-foreground">{t.name}</span>
                <span className="shrink-0 text-sm font-semibold text-brand">
                  {formatIdr(t.price)}
                </span>
              </div>
              {t.subtitle ? (
                <p className="mt-1 text-xs uppercase tracking-wider text-brand/90">
                  {t.subtitle}
                </p>
              ) : null}
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted">
                {t.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {showCollarPicker(kind) ? (
        <div>
          <h2 className="font-display text-xl tracking-wide text-foreground">
            Tipe kerah
          </h2>
          <p className="mt-1 text-sm text-muted">
            Pilihan kerah jersey. Ada opsi dengan tambahan harga.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {collarOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCollarId(c.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  collarId === c.id
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-white/10 text-muted hover:border-white/25 hover:text-foreground",
                )}
              >
                <span>{c.label}</span>
                <span className="text-xs font-medium text-brand">
                  {c.surcharge ? `+${formatIdr(c.surcharge)}` : "—"}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="font-display text-xl tracking-wide text-foreground">
          Ukuran
        </h2>
        <p className="mt-1 text-sm text-muted">
          S, M, L, XL, XXL, XXXL. Oversize: +{formatIdr(oversizeSurcharge)}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={cn(
                "min-w-[3rem] rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                size === s
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-white/15 text-muted hover:border-white/30 hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
          <input
            type="checkbox"
            checked={oversize}
            onChange={(e) => setOversize(e.target.checked)}
            className="size-4 accent-brand"
          />
          <span className="text-sm text-foreground">
            Oversize (+{formatIdr(oversizeSurcharge)})
          </span>
        </label>
      </div>

      <div>
        <h2 className="font-display text-xl tracking-wide text-foreground">
          Biaya tambahan & opsi
        </h2>
        <div className="mt-4 space-y-3">
          {additionalOptions.map((opt) => {
            if (opt.group === "fabric-extra") return null;
            if (opt.input === "quantity") {
              return (
                <div
                  key={opt.id}
                  className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted">
                      +{formatIdr(opt.price)} per kelipatan
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={upSizeQty}
                    onChange={(e) =>
                      setUpSizeQty(Math.max(0, Number.parseInt(e.target.value, 10) || 0))
                    }
                    className="h-10 w-24 rounded-md border border-white/15 bg-background px-3 text-sm text-foreground"
                  />
                </div>
              );
            }
            const disabled3d = opt.id === "3d-logo" && ultimateIncludes3d;
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-4 py-3",
                  disabled3d
                    ? "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-60"
                    : "cursor-pointer border-white/10 bg-white/[0.02]",
                )}
              >
                <input
                  type="checkbox"
                  disabled={disabled3d}
                  checked={!!addOns[opt.id] && !disabled3d}
                  onChange={() => toggleAddOn(opt.id)}
                  className="mt-0.5 size-4 accent-brand disabled:opacity-40"
                />
                <span className="flex-1 text-sm">
                  <span className="text-foreground">{opt.label}</span>
                  {disabled3d ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      Sudah termasuk paket Ultimate
                    </span>
                  ) : opt.description ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      {opt.description}
                    </span>
                  ) : null}
                  {!disabled3d ? (
                    <span className="mt-1 block text-xs font-medium text-brand">
                      {opt.price >= 0 ? `+${formatIdr(opt.price)}` : formatIdr(opt.price)}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-foreground">Kain emboss / jacquard</p>
            <p className="mt-1 text-xs text-muted">Pilih salah satu jika perlu.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFabricExtra(null)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                  fabricExtra === null
                    ? "border-brand bg-brand/15 text-brand"
                    : "border-white/15 text-muted hover:text-foreground",
                )}
              >
                Tanpa
              </button>
              <button
                type="button"
                onClick={() => setFabricExtra("emboss")}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold",
                  fabricExtra === "emboss"
                    ? "border-brand bg-brand/15 text-brand"
                    : "border-white/15 text-muted hover:text-foreground",
                )}
              >
                Emboss (+{formatIdr(10_000)})
              </button>
              <button
                type="button"
                onClick={() => setFabricExtra("jacquard")}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold",
                  fabricExtra === "jacquard"
                    ? "border-brand bg-brand/15 text-brand"
                    : "border-white/15 text-muted hover:text-foreground",
                )}
              >
                Jacquard (+{formatIdr(15_000)})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand/25 bg-brand/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Estimasi
        </p>
        <p className="mt-2 font-display text-3xl text-foreground">{formatIdr(total)}</p>
        <p className="mt-2 text-xs text-muted">
          Belum termasuk ongkir & diskon qty. Checkout web memakai harga varian Medusa (paket +
          ukuran); kerah & add-on ikut di metadata untuk admin. Final bisa lewat chat.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="xl" className="w-full sm:w-auto">
            <a href={waHref} target="_blank" rel="noreferrer">
              Kirim ringkasan ke WhatsApp
            </a>
          </Button>
          {checkoutEnabled ? (
            <Button
              type="button"
              size="xl"
              variant="outline"
              className="w-full border-white/25 bg-background/60 sm:w-auto"
              disabled={!tier || isPending}
              onClick={addToWebsiteCart}
            >
              {isPending ? "Menambahkan…" : "Tambah ke keranjang (checkout)"}
            </Button>
          ) : null}
        </div>
        {cartError ? (
          <p className="mt-3 text-xs text-red-400" role="alert">
            {cartError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
