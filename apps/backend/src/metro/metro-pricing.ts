/**
 * Harga Metro (IDR) — selaras dengan `apps/storefront/lib/data/catalog.ts`.
 * Checkout baris konfigurator: total + `metro_price_breakdown` lewat route store
 * `POST /store/carts/:id/metro-line` (harga dasar = varian Medusa + kerah/add-on).
 *
 * Add-on global + filter produk: `metro-store-addons` / Admin → Metro add-on & Metro collars.
 */

export type ProductKind =
  | "jersey-top"
  | "jersey-set"
  | "training-pants"
  | "jacket"
  | "short-pants"
  | "polo";

const PRODUCT_KIND_VALUES: ProductKind[] = [
  "jersey-top",
  "jersey-set",
  "training-pants",
  "jacket",
  "short-pants",
  "polo",
];

export function parseProductKind(value: unknown): ProductKind | null {
  if (typeof value !== "string") return null;
  return PRODUCT_KIND_VALUES.includes(value as ProductKind)
    ? (value as ProductKind)
    : null;
}

export type PricelistTier = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  features: string[];
  highlight?: boolean;
};

export const jerseyTopTiers: PricelistTier[] = [
  {
    id: "essential",
    name: "Essential",
    price: 60_000,
    features: [
      "Atasan print depan",
      "Logo, nama, dan nomor punggung DTF/Poliflex",
      "Kerah basic",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 90_000,
    features: [
      "Atasan full printing",
      "Kerah basic",
      "Pola potongan basic",
      "Bahan premium",
    ],
  },
  {
    id: "prime",
    name: "Prime",
    price: 110_000,
    features: [
      "Atasan full printing",
      "Kerah variatif",
      "Pola potongan variatif",
      "Bahan premium",
    ],
  },
];

export const jerseySetTiers: PricelistTier[] = [
  {
    id: "regular",
    name: "Regular (Basic)",
    price: 95_000,
    features: [
      "DTF/Poliflex sublim",
      "Dryfit standard sport",
      "Atasan & bawahan non printing",
      "Nama, nomor, dan logo sablon DTF/Poliflex",
      "Dryfit basic milano",
      "Kerah basic V-neck / O-neck",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    subtitle: "Most popular",
    price: 125_000,
    highlight: true,
    features: [
      "Printing atasan",
      "Dryfit premium",
      "Atasan full printing",
      "Bawahan non printing",
      "Basic kerah",
      "Premium dryfit",
    ],
  },
  {
    id: "premium",
    name: "Premium (Advanced)",
    price: 135_000,
    features: [
      "Full printing atas bawah",
      "Kerah variatif",
      "Premium dryfit",
      "Pola variatif & double stitch",
      "Bahan premium",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate (Professional)",
    price: 170_000,
    features: [
      "Full printing atas bawah",
      "Kerah variatif",
      "Premium dryfit",
      "Kerah, atasan, dan bawahan pola variatif",
      "3D logo",
      "Kain emboss/jacquard & double stitch",
      "Foto studio",
    ],
  },
];

export const trainingPantsTiers: PricelistTier[] = [
  {
    id: "tp-full",
    name: "Full printing",
    price: 95_000,
    features: ["Full printing", "Material: Lotto"],
  },
  {
    id: "tp-non",
    name: "Non printing",
    price: 75_000,
    features: ["Non printing", "Material: Lotto"],
  },
];

export const jacketTiers: PricelistTier[] = [
  {
    id: "jk-print",
    name: "Printing",
    price: 175_000,
    features: ["Printing", "Material: Lotto"],
  },
  {
    id: "jk-non",
    name: "Non printing + bordir",
    price: 130_000,
    features: ["Non printing + bordir", "Material: Lotto"],
  },
];

export const shortPantsTiers: PricelistTier[] = [
  {
    id: "sp-full",
    name: "Full printing",
    price: 60_000,
    features: ["Full printing", "Material: Lotto"],
  },
  {
    id: "sp-side",
    name: "Print samping",
    price: 50_000,
    features: ["Print samping", "Material: Lotto"],
  },
];

export const poloTiers: PricelistTier[] = [
  {
    id: "polo-bordir",
    name: "Polo bordir",
    price: 90_000,
    features: ["Polo bordir", "Material: CVC 24S"],
  },
];

export type CollarOption = {
  id: string;
  label: string;
  surcharge: number;
};

/** Default kerah — diganti oleh metadata toko `metro_collar_rules` (Admin → Metro collars). */
export const defaultCollarOptions: CollarOption[] = [
  { id: "o-neck", label: "O-neck", surcharge: 0 },
  { id: "o-neck-2", label: "O-neck 2.0", surcharge: 0 },
  { id: "o-neck-3", label: "O-neck 3.0", surcharge: 5_000 },
  { id: "nike", label: "Nike", surcharge: 0 },
  { id: "v-neck", label: "V-neck", surcharge: 0 },
  { id: "v-neck-silang", label: "V-neck silang", surcharge: 0 },
  { id: "v-neck-rata-2", label: "V-neck rata 2.0", surcharge: 0 },
  { id: "v-neck-rata", label: "V-neck rata", surcharge: 0 },
  { id: "v-neck-2", label: "V-neck 2.0", surcharge: 5_000 },
  { id: "polo-x-v-2", label: "Polo x V-neck 2.0", surcharge: 15_000 },
  { id: "polo-x-v", label: "Polo x V-neck", surcharge: 10_000 },
  { id: "polo-x-v-rata-2", label: "Polo x V-neck rata 2.0", surcharge: 10_000 },
  { id: "polo-x-v-rata", label: "Polo x V-neck rata", surcharge: 15_000 },
  { id: "polo-kancing", label: "Polo kancing", surcharge: 15_000 },
  { id: "polo-x-v-tutup", label: "Polo x V tutup", surcharge: 10_000 },
];

export const oversizeSurcharge = 15_000;

export type AdditionalOption = {
  id: string;
  label: string;
  description?: string;
  price: number;
  input?: "quantity";
  group?: "fabric-extra";
};

/** Default add-on bila produk tidak punya `metro_addon_catalog` di metadata. */
export const defaultAdditionalOptions: AdditionalOption[] = [
  { id: "3d-logo", label: "3D logo", price: 20_000 },
  // {
  //   id: "up-size",
  //   label: "Up size",
  //   description: "Berlaku per kelipatan",
  //   price: 10_000,
  //   input: "quantity",
  // },
  { id: "long-sleeve", label: "Lengan panjang (long sleeve)", price: 10_000 },
  {
    id: "sponsor-front",
    label: "Add sponsor - depan",
    description: "Penyesuaian harga per daftar klien",
    price: -10_000,
  },
  {
    id: "sponsor-back",
    label: "Add sponsor - belakang",
    description: "Penyesuaian harga per daftar klien",
    price: -5_000,
  },
  { id: "rib", label: "Kain rib", price: 5_000 },
  {
    id: "emboss",
    label: "Kain emboss",
    price: 10_000,
    group: "fabric-extra",
  },
  {
    id: "jacquard",
    label: "Kain jacquard",
    price: 15_000,
    group: "fabric-extra",
  },
  {
    id: "singlet",
    label: "Singlet",
    description: "Penyesuaian harga per daftar klien",
    price: -5_000,
  },
  { id: "raglan", label: "Raglan", price: 10_000 },
];

export function tiersForKind(kind: ProductKind): PricelistTier[] {
  switch (kind) {
    case "jersey-top":
      return jerseyTopTiers;
    case "jersey-set":
      return jerseySetTiers;
    case "training-pants":
      return trainingPantsTiers;
    case "jacket":
      return jacketTiers;
    case "short-pants":
      return shortPantsTiers;
    case "polo":
      return poloTiers;
    default:
      return [];
  }
}

export function showCollarPicker(kind: ProductKind): boolean {
  return kind === "jersey-top" || kind === "jersey-set";
}

export type MetroPriceLine = { label: string; amount: number };

/**
 * Parse `product.metadata.metro_addon_catalog` (JSON string).
 * Mengembalikan null jika tidak ada / invalid - caller pakai `defaultAdditionalOptions`.
 */
export function parseAddonCatalogFromProductMetadata(
  productMetadata: Record<string, unknown> | null | undefined,
): AdditionalOption[] | null {
  const raw = productMetadata?.metro_addon_catalog;
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: AdditionalOption[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.label !== "string") continue;
      if (typeof r.price !== "number" || Number.isNaN(r.price)) continue;
      out.push({
        id: r.id,
        label: r.label,
        description:
          typeof r.description === "string" ? r.description : undefined,
        price: r.price,
        input: r.input === "quantity" ? "quantity" : undefined,
        group: r.group === "fabric-extra" ? "fabric-extra" : undefined,
      });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

/** Infer `tier_id` katalog dari label nilai opsi "Paket" (nama tampilan di Medusa). */
export function inferTierIdFromPackageLabel(label: string): string | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  for (const k of PRODUCT_KIND_VALUES) {
    const t = tiersForKind(k).find((x) => x.name === trimmed);
    if (t) return t.id;
  }
  return null;
}

/** Untuk aturan add-on Ultimate / 3D — hanya jersey set resmi. */
export function inferJerseyKindFromProductHandle(
  handle: string,
): ProductKind | null {
  if (handle === "jersey-atasan") return "jersey-top";
  if (handle === "jersey-satu-set") return "jersey-set";
  return null;
}

export function showCollarPickerForProductHandle(handle: string): boolean {
  return handle === "jersey-atasan" || handle === "jersey-satu-set";
}

export type ComputeMetroLineInput = {
  metadata: Record<string, string>;
  addonCatalog: AdditionalOption[];
  collarCatalog: CollarOption[];
  /** Harga dasar varian Medusa (minor currency / IDR). */
  basePackageAmount: number;
  /** Baris pertama breakdown, mis. "Paket (Essential)". */
  basePackageLabel: string;
  /** Untuk aturan 3d-logo saat Ultimate. */
  productKind: ProductKind | null;
  /** Kerah: hanya produk jersey atasan / set. */
  applyCollar: boolean;
};

/**
 * Hitung total & rincian dari metadata baris (configurator storefront).
 * Harga dasar paket = **nilai dari Medusa** (`basePackageAmount`), bukan pricelist statis.
 */
export function computeMetroLineFromMetadata(
  input: ComputeMetroLineInput,
): { total: number; breakdown: MetroPriceLine[] } {
  const {
    metadata,
    addonCatalog,
    collarCatalog,
    basePackageAmount,
    basePackageLabel,
    productKind,
    applyCollar,
  } = input;

  const breakdown: MetroPriceLine[] = [];
  if (!Number.isFinite(basePackageAmount) || basePackageAmount <= 0) {
    return {
      total: 0,
      breakdown: [{ label: "Harga dasar varian tidak valid", amount: 0 }],
    };
  }

  breakdown.push({ label: basePackageLabel, amount: basePackageAmount });
  let sum = basePackageAmount;

  const tierId = metadata.tier_id ?? "";

  if (applyCollar) {
    const collarId = metadata.collar_id ?? "";
    const collarExtra =
      collarCatalog.find((c) => c.id === collarId)?.surcharge ?? 0;
    if (collarExtra) {
      const label =
        collarCatalog.find((c) => c.id === collarId)?.label ?? "Kerah";
      breakdown.push({ label: `Kerah (${label})`, amount: collarExtra });
      sum += collarExtra;
    }
  }

  if (metadata.oversize === "yes") {
    breakdown.push({ label: "Oversize", amount: oversizeSurcharge });
    sum += oversizeSurcharge;
  }

  const upSizeQty = Math.max(
    0,
    parseInt(metadata.up_size_qty ?? "0", 10) || 0,
  );
  const upUnit =
    addonCatalog.find((o) => o.id === "up-size" && o.input === "quantity")
      ?.price ?? 10_000;
  const upExtra = upSizeQty * upUnit;
  if (upExtra) {
    breakdown.push({ label: `Up size (x${upSizeQty})`, amount: upExtra });
    sum += upExtra;
  }

  const fabric = metadata.fabric_extra ?? "";
  if (fabric === "emboss") {
    const opt = addonCatalog.find(
      (o) => o.id === "emboss" && o.group === "fabric-extra",
    );
    const amt = opt?.price ?? 10_000;
    breakdown.push({ label: opt?.label ?? "Kain emboss", amount: amt });
    sum += amt;
  } else if (fabric === "jacquard") {
    const opt = addonCatalog.find(
      (o) => o.id === "jacquard" && o.group === "fabric-extra",
    );
    const amt = opt?.price ?? 15_000;
    breakdown.push({ label: opt?.label ?? "Kain jacquard", amount: amt });
    sum += amt;
  }

  const ultimateIncludes3d =
    productKind === "jersey-set" && tierId === "ultimate";

  let addonIds: string[] = [];
  try {
    const parsed = JSON.parse(metadata.addons_json || "[]") as unknown;
    addonIds = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    addonIds = [];
  }
  const selected = new Set(addonIds);

  for (const opt of addonCatalog) {
    if (opt.group === "fabric-extra") continue;
    if (opt.input === "quantity") continue;
    if (opt.id === "3d-logo" && ultimateIncludes3d) continue;
    if (selected.has(opt.id)) {
      breakdown.push({ label: opt.label, amount: opt.price });
      sum += opt.price;
    }
  }

  return { total: sum, breakdown };
}
