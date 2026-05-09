import type { HttpTypes } from "@medusajs/types";

type VariantOptionRow = NonNullable<
  HttpTypes.StoreProductVariant["options"]
>[number];

function coerceMinorAmount(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

/** Harga varian dari konteks region (minor unit untuk IDR di Medusa 2). */
export function variantCalculatedAmount(
  v: HttpTypes.StoreProductVariant,
): number | null {
  const cp = v.calculated_price as
    | { calculated_amount?: unknown; original_amount?: unknown }
    | null
    | undefined;
  const fromCalc =
    coerceMinorAmount(cp?.calculated_amount) ??
    coerceMinorAmount(cp?.original_amount);
  if (fromCalc !== null) return fromCalc;

  const raw = v as unknown as { prices?: { amount?: unknown }[] };
  const prices = raw.prices;
  if (Array.isArray(prices) && prices.length > 0) {
    const a = coerceMinorAmount(prices[0]?.amount);
    if (a !== null) return a;
  }

  return null;
}

export function minMaxVariantPrices(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
): { min: number | null; max: number | null } {
  const amounts = (variants ?? [])
    .map((v) => variantCalculatedAmount(v))
    .filter((n): n is number => n !== null);
  if (!amounts.length) return { min: null, max: null };
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

function variantOptionMap(
  v: HttpTypes.StoreProductVariant,
): Map<string, string> {
  const m = new Map<string, string>();
  for (const o of v.options ?? []) {
    const id = o.option_id ?? o.option?.id;
    if (id) m.set(id, o.value);
  }
  return m;
}

/** True if variant matches current selection for every key in `selection`. */
export function variantMatchesPartialSelection(
  v: HttpTypes.StoreProductVariant,
  selection: Record<string, string>,
): boolean {
  const map = variantOptionMap(v);
  for (const [optId, val] of Object.entries(selection)) {
    if (map.get(optId) !== val) return false;
  }
  return true;
}

/**
 * Cari varian yang sama dengan `current` kecuali pada `optionId` diganti `newValue`
 * (untuk UI matriks opsi Medusa).
 */
export function findVariantAfterOptionChange(
  variants: HttpTypes.StoreProductVariant[],
  current: HttpTypes.StoreProductVariant | null,
  optionId: string,
  newValue: string,
): HttpTypes.StoreProductVariant | undefined {
  return variants.find((v) => {
    const vo = variantOptionMap(v);
    if (vo.get(optionId) !== newValue) return false;
    if (!current?.options?.length) return true;
    const cur = variantOptionMap(current);
    for (const [id, val] of cur.entries()) {
      if (id === optionId) continue;
      if (vo.get(id) !== val) return false;
    }
    return true;
  });
}

/** Nilai opsi yang masih bisa dipilih di `optionId` tanpa mengubah pilihan lain pada `current`. */
export function selectableValuesForOption(
  variants: HttpTypes.StoreProductVariant[],
  current: HttpTypes.StoreProductVariant | null,
  optionId: string,
): Set<string> {
  const set = new Set<string>();
  if (!current) {
    for (const v of variants) {
      const val = variantOptionMap(v).get(optionId);
      if (val) set.add(val);
    }
    return set;
  }
  const cur = variantOptionMap(current);
  for (const v of variants) {
    const vo = variantOptionMap(v);
    let ok = true;
    for (const [id, val] of cur.entries()) {
      if (id === optionId) continue;
      if (vo.get(id) !== val) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const val = vo.get(optionId);
      if (val) set.add(val);
    }
  }
  return set;
}

export function defaultVariantChoice(
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
): HttpTypes.StoreProductVariant | null {
  const list = variants ?? [];
  if (!list.length) return null;
  let best = list[0]!;
  let bestAmt = variantCalculatedAmount(best);
  for (const v of list.slice(1)) {
    const a = variantCalculatedAmount(v);
    if (bestAmt === null || (a !== null && a < bestAmt)) {
      best = v;
      bestAmt = a;
    }
  }
  return best;
}
