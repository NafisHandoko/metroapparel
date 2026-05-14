"use client";

import type { HttpTypes } from "@medusajs/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { addMetroConfiguratorToCartAction } from "@/app/actions/metro-cart";
import { Button } from "@/components/ui/button";
import {
  formatIdr,
  inferTierIdFromPackageLabel,
  oversizeSurcharge,
  showCollarPickerForProductHandle,
  sizeOptions,
  type AdditionalOption,
  type CollarOption,
  type ProductKind,
  type SizeOption,
} from "@/lib/data/catalog";
import {
  metroBulletsForOptionValue,
  parseMetroOptionDetailsFromMetadata,
} from "@/lib/medusa/metro-option-details";
import {
  defaultVariantChoice,
  findVariantAfterOptionChange,
  selectableValuesForOption,
  variantCalculatedAmount,
} from "@/lib/medusa/variant-picker";
import { useSiteContent } from "@/components/site-content-provider";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Placeholder ukuran untuk mode tim — backend wajib `size` non-kosong; harga tidak memakai field ini. */
const TEAM_SIZE_PLACEHOLDER = "—";

const MAX_TEAM_NOTES_CHARS = 12000;

type OrderMode = "single" | "team";

type MedusaVariantConfiguratorProps = {
  product: HttpTypes.StoreProduct;
  addonOptions: AdditionalOption[];
  collarOptions: CollarOption[];
};

function optionsOrdered(
  product: HttpTypes.StoreProduct,
): NonNullable<HttpTypes.StoreProduct["options"]> {
  return [...(product.options ?? [])];
}

function inferPackageFromVariant(
  v: HttpTypes.StoreProductVariant | null,
): { tierId: string; tierName: string } {
  if (!v?.options?.length) return { tierId: "", tierName: "" };
  for (const o of v.options) {
    const id = inferTierIdFromPackageLabel(o.value);
    if (id) return { tierId: id, tierName: o.value };
  }
  const first = v.options[0];
  return { tierId: "", tierName: first?.value ?? v.title ?? "" };
}

function priceForOptionValue(
  variants: HttpTypes.StoreProductVariant[],
  selected: HttpTypes.StoreProductVariant | null,
  optionId: string,
  value: string,
): number | null {
  const v = findVariantAfterOptionChange(variants, selected, optionId, value);
  return v ? variantCalculatedAmount(v) : null;
}

export function MedusaVariantConfigurator({
  product,
  addonOptions,
  collarOptions,
}: MedusaVariantConfiguratorProps) {
  const { company } = useSiteContent();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cartError, setCartError] = useState<string | null>(null);

  const variants = useMemo(
    () => product.variants ?? [],
    [product.variants],
  );

  const options = useMemo(() => optionsOrdered(product), [product]);

  const optionDetailsDoc = useMemo(
    () =>
      parseMetroOptionDetailsFromMetadata(
        product.metadata as Record<string, unknown> | null | undefined,
      ),
    [product.metadata],
  );

  const [selected, setSelected] = useState<HttpTypes.StoreProductVariant | null>(
    () => defaultVariantChoice(variants),
  );

  const productHandle = product.handle ?? "";
  const showCollar = showCollarPickerForProductHandle(productHandle);
  const jerseyKind: ProductKind | null = useMemo(() => {
    if (productHandle === "jersey-atasan") return "jersey-top";
    if (productHandle === "jersey-satu-set") return "jersey-set";
    return null;
  }, [productHandle]);

  const [collarId, setCollarId] = useState(
    () => collarOptions[0]?.id ?? "o-neck",
  );
  const [orderMode, setOrderMode] = useState<OrderMode>("team");
  const [teamNotes, setTeamNotes] = useState("");
  const [size, setSize] = useState<SizeOption>("M");
  const [oversize, setOversize] = useState(false);
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});
  const [upSizeQty, setUpSizeQty] = useState(0);
  const [fabricExtra, setFabricExtra] = useState<"emboss" | "jacquard" | null>(
    null,
  );

  const resolvedCollarId = useMemo(
    () =>
      collarOptions.some((c) => c.id === collarId)
        ? collarId
        : (collarOptions[0]?.id ?? "o-neck"),
    [collarOptions, collarId],
  );

  const { tierId, tierName } = useMemo(
    () => inferPackageFromVariant(selected),
    [selected],
  );

  const ultimateIncludes3d =
    jerseyKind === "jersey-set" && tierId === "ultimate";

  const collar = collarOptions.find((c) => c.id === resolvedCollarId);
  const collarExtra = showCollar ? (collar?.surcharge ?? 0) : 0;

  const embossFabric = addonOptions.find(
    (o) => o.id === "emboss" && o.group === "fabric-extra",
  );
  const jacquardFabric = addonOptions.find(
    (o) => o.id === "jacquard" && o.group === "fabric-extra",
  );
  const embossPrice = embossFabric?.price ?? 10_000;
  const jacquardPrice = jacquardFabric?.price ?? 15_000;
  const upSizeUnit =
    addonOptions.find((o) => o.id === "up-size" && o.input === "quantity")
      ?.price ?? 10_000;

  const baseVariantUnit = selected ? variantCalculatedAmount(selected) : null;

  const effectiveOversize = orderMode === "single" && oversize;

  const total = useMemo(() => {
    let sum = baseVariantUnit ?? 0;
    sum += collarExtra;
    if (effectiveOversize) sum += oversizeSurcharge;
    sum += upSizeQty * upSizeUnit;
    if (fabricExtra === "emboss") sum += embossPrice;
    if (fabricExtra === "jacquard") sum += jacquardPrice;
    for (const opt of addonOptions) {
      if (opt.group === "fabric-extra") continue;
      if (opt.input === "quantity") continue;
      if (opt.id === "3d-logo" && ultimateIncludes3d) continue;
      if (addOns[opt.id]) sum += opt.price;
    }
    return sum;
  }, [
    baseVariantUnit,
    collarExtra,
    effectiveOversize,
    upSizeQty,
    upSizeUnit,
    fabricExtra,
    embossPrice,
    jacquardPrice,
    addonOptions,
    addOns,
    ultimateIncludes3d,
  ]);

  const checkoutEnabled =
    typeof process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY === "string" &&
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.length > 0;

  const waMessage = useMemo(() => {
    const lines = [
      `Halo ${company.name},`,
      `Saya tertarik: *${product.title}* (/products/${productHandle})`,
    ];
    for (const opt of options) {
      const val =
        selected?.options?.find((o) => o.option_id === opt.id)?.value ?? "";
      if (val) lines.push(`${opt.title}: *${val}*`);
    }
    if (baseVariantUnit !== null) {
      lines.push(`Harga varian Medusa: *${formatIdr(baseVariantUnit)}*`);
    }
    if (showCollar && collar) {
      lines.push(
        `Kerah: *${collar.label}*${collar.surcharge ? ` (+${formatIdr(collar.surcharge)})` : ""}`,
      );
    }
    lines.push(
      `Tipe pemesanan: *${orderMode === "single" ? "Satuan" : "Tim / banyak"}*`,
    );
    if (orderMode === "single") {
      lines.push(`Ukuran: *${size}*${oversize ? " + *Oversize*" : ""}`);
    } else if (teamNotes.trim()) {
      lines.push(`Daftar / catatan:\n${teamNotes.trim()}`);
    }
    lines.push(`Perkiraan total: *${formatIdr(total)}*`);
    lines.push("Mohon info MOQ dan jadwal. Terima kasih!");
    return lines.join("\n");
  }, [
    company.name,
    product.title,
    productHandle,
    options,
    selected,
    baseVariantUnit,
    showCollar,
    collar,
    orderMode,
    teamNotes,
    size,
    oversize,
    total,
  ]);

  const waHref = getWhatsAppLink(waMessage, company.whatsappDigits);

  function onPickOptionValue(optionId: string, value: string) {
    const next = findVariantAfterOptionChange(
      variants,
      selected,
      optionId,
      value,
    );
    if (next) setSelected(next);
  }

  function toggleAddOn(id: string) {
    setAddOns((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function buildLineMetadata(): Record<string, string> {
    const addonIds = addonOptions
      .filter(
        (o) =>
          !o.group &&
          o.input !== "quantity" &&
          addOns[o.id] &&
          !(o.id === "3d-logo" && ultimateIncludes3d),
      )
      .map((o) => o.id);

    const { tierId: tid, tierName: tname } = inferPackageFromVariant(selected);

    const mode: OrderMode = orderMode;
    const notesTrim = teamNotes.slice(0, MAX_TEAM_NOTES_CHARS).trimEnd();

    return {
      product_name: product.title ?? "",
      product_handle: productHandle,
      product_title: product.title ?? "",
      tier_id: tid,
      tier_name: tname,
      base_variant_unit_idr:
        baseVariantUnit !== null ? String(Math.round(baseVariantUnit)) : "0",
      metro_order_mode: mode,
      metro_order_notes: mode === "team" ? notesTrim : "",
      size: mode === "single" ? size : TEAM_SIZE_PLACEHOLDER,
      oversize: mode === "single" && oversize ? "yes" : "no",
      collar_id: showCollar ? resolvedCollarId : "",
      collar_label: showCollar ? (collar?.label ?? "") : "",
      fabric_extra: fabricExtra ?? "",
      up_size_qty: String(upSizeQty),
      addons_json: JSON.stringify(addonIds),
      estimated_total_idr: String(Math.round(total)),
    };
  }

  function addToWebsiteCart() {
    if (!selected?.id || baseVariantUnit === null) return;
    setCartError(null);
    startTransition(async () => {
      const res = await addMetroConfiguratorToCartAction({
        productHandle,
        variantId: selected.id,
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

  if (!variants.length) {
    return (
      <p className="mt-10 text-sm text-muted">
        Produk ini belum punya varian di Medusa. Tambahkan varian & harga di Admin agar bisa
        dipesan.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-10 border-t border-white/10 pt-10">
      {options.map((opt) => {
        const allowed = selectableValuesForOption(
          variants,
          selected,
          opt.id,
        );
        const values = (opt.values ?? []).filter((v) => allowed.has(v.value));
        const valuesByPrice = [...values].sort((a, b) => {
          const pa = priceForOptionValue(
            variants,
            selected,
            opt.id,
            a.value,
          );
          const pb = priceForOptionValue(
            variants,
            selected,
            opt.id,
            b.value,
          );
          const na = pa === null ? Number.POSITIVE_INFINITY : pa;
          const nb = pb === null ? Number.POSITIVE_INFINITY : pb;
          if (na !== nb) return na - nb;
          return a.value.localeCompare(b.value);
        });
        const currentVal =
          selected?.options?.find((o) => o.option_id === opt.id)?.value ?? "";

        return (
          <div key={opt.id}>
            <h2 className="font-display text-xl tracking-wide text-foreground">
              {opt.title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {valuesByPrice.map((v) => {
                const amt = priceForOptionValue(
                  variants,
                  selected,
                  opt.id,
                  v.value,
                );
                const bullets = metroBulletsForOptionValue(
                  optionDetailsDoc,
                  opt.id ?? "",
                  v.value,
                );
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onPickOptionValue(opt.id, v.value)}
                    className={cn(
                      "max-w-[min(100%,18rem)] rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors",
                      currentVal === v.value
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-white/15 text-muted hover:border-white/30 hover:text-foreground",
                    )}
                  >
                    <span>{v.value}</span>
                    {amt !== null ? (
                      <span className="mt-0.5 block text-xs font-medium text-brand/90">
                        {formatIdr(amt)}
                      </span>
                    ) : null}
                    {bullets.length ? (
                      <ul className="mt-2 list-disc pl-4 text-left text-xs font-normal normal-case leading-snug text-muted">
                        {bullets.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {showCollar ? (
        <div>
          <h2 className="font-display text-xl tracking-wide text-foreground">
            Tipe kerah
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {collarOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCollarId(c.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  resolvedCollarId === c.id
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
          Biaya tambahan & opsi
        </h2>
        <div className="mt-4 space-y-3">
          {addonOptions.map((opt) => {
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
                      +{formatIdr(upSizeUnit)} per kelipatan
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
                Emboss (+{formatIdr(embossPrice)})
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
                Jacquard (+{formatIdr(jacquardPrice)})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl tracking-wide text-foreground">
          Cara memesan
        </h2>
        <p className="mt-1 text-sm text-muted">
          Satuan: satu ukuran per baris keranjang. Tim / banyak: tulis daftar nama, nomor punggung,
          dan ukuran (atau ringkasan ukuran) di kolom catatan.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setOrderMode("single")}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              orderMode === "single"
                ? "border-brand bg-brand/10 text-foreground"
                : "border-white/10 text-muted hover:border-white/25 hover:text-foreground",
            )}
          >
            <span className="font-semibold">Satuan</span>
            <span className="mt-0.5 block text-xs text-muted">Satu potong, pilih ukuran di bawah</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderMode("team")}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              orderMode === "team"
                ? "border-brand bg-brand/10 text-foreground"
                : "border-white/10 text-muted hover:border-white/25 hover:text-foreground",
            )}
          >
            <span className="font-semibold">Tim / banyak</span>
            <span className="mt-0.5 block text-xs text-muted">Daftar pemain atau ringkasan ukuran</span>
          </button>
        </div>

        {orderMode === "single" ? (
          <div className="mt-8">
            <h2 className="font-display text-xl tracking-wide text-foreground">Ukuran</h2>
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
        ) : (
          <div className="mt-8">
            <label htmlFor="metro-team-notes" className="font-display text-xl tracking-wide text-foreground">
              Catatan pemesanan
            </label>
            <p className="mt-1 text-sm text-muted">
              Contoh jersey:{" "}
              <span className="font-mono text-xs text-foreground/80">
                ANDI (49) (L) / BUDI (7) (M)
              </span>
              . Contoh non-custom:{" "}
              <span className="font-mono text-xs text-foreground/80">M: 7, L: 3, XL: 2</span>.
            </p>
            <textarea
              id="metro-team-notes"
              value={teamNotes}
              onChange={(e) =>
                setTeamNotes(e.target.value.slice(0, MAX_TEAM_NOTES_CHARS))
              }
              rows={10}
              placeholder={`Tulis daftar nama, nomor punggung, ukuran, atau catatan lain untuk tim Anda…\nContoh:\nANDI (49) (L)\nBUDI (7) (M)\nDODI S (10) (L)\n...\natau\nS: 7, L: 3, XL: 2, ...`}
              className="mt-3 w-full resize-y rounded-lg border border-white/15 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none ring-brand/30 placeholder:text-muted focus:border-brand focus:ring-2"
            />
            <p className="mt-1 text-xs text-muted tabular-nums">
              {teamNotes.length}/{MAX_TEAM_NOTES_CHARS} karakter
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-brand/25 bg-brand/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Estimasi Per Produk
        </p>
        <p className="mt-2 font-display text-3xl text-foreground">{formatIdr(total)}</p>
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
              disabled={!selected?.id || baseVariantUnit === null || isPending}
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
