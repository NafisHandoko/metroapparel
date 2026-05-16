/** Harga dalam Rupiah (IDR). */

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
  /** Tambahan harga kerah (bisa 0). */
  surcharge: number;
};

/** Fallback jika API kerah gagal; sumber utama = Admin → Settings → Metro collars. */
export const collarOptions: CollarOption[] = [
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

export const sizeOptions = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;
export type SizeOption = (typeof sizeOptions)[number];

export const oversizeSurcharge = 15_000;

export type AdditionalOption = {
  id: string;
  label: string;
  description?: string;
  price: number;
  /** Untuk up size: jumlah kelipatan. */
  input?: "quantity";
  /** Hanya satu dari grup (mis. emboss vs jacquard). */
  group?: "fabric-extra";
};

/** Fallback bila API add-on gagal; sumber utama = Medusa Admin → Settings → Metro add-on. */
export const additionalOptions: AdditionalOption[] = [
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

export function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

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

export function minPriceForKind(kind: ProductKind): number {
  const tiers = tiersForKind(kind);
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((t) => t.price));
}

export function showCollarPicker(kind: ProductKind): boolean {
  return kind === "jersey-top" || kind === "jersey-set";
}

/** Cocokkan label nilai opsi Medusa ke `tier.id` di pricelist (untuk metadata & aturan add-on). */
export function inferTierIdFromPackageLabel(label: string): string | null {
  const t = label.trim();
  if (!t) return null;
  for (const kind of PRODUCT_KIND_VALUES) {
    const row = tiersForKind(kind).find((x) => x.name === t);
    if (row) return row.id;
  }
  return null;
}

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

/** Pilihan keperluan jersey custom — disimpan di metadata baris keranjang / order. */
export type JerseyPurposeOption = { id: string; label: string };

export const JERSEY_PURPOSE_OTHER_ID = "lainnya";

export const jerseyPurposeOtherMaxChars = 120;

export const jerseyPurposeOptions: JerseyPurposeOption[] = [
  { id: "futsal", label: "Futsal" },
  { id: "sepak-bola", label: "Sepak bola" },
  { id: "voli", label: "Voli" },
  { id: "basket", label: "Basket" },
  { id: "badminton", label: "Bulu tangkis" },
  { id: "lari", label: "Lari / fun run" },
  { id: "esports", label: "Esports" },
  { id: "komunitas", label: "Komunitas / event" },
  { id: JERSEY_PURPOSE_OTHER_ID, label: "Lainnya" },
];

export function jerseyPurposeLabelById(id: string): string | undefined {
  return jerseyPurposeOptions.find((o) => o.id === id)?.label;
}

/** Label untuk metadata / admin — gabung teks bebas bila opsi Lainnya. */
export function formatJerseyPurposeLabel(id: string, otherText?: string): string {
  if (!id) return "";
  if (id === JERSEY_PURPOSE_OTHER_ID) {
    const custom = otherText?.trim() ?? "";
    return custom ? `Lainnya — ${custom}` : "Lainnya";
  }
  return jerseyPurposeLabelById(id) ?? "";
}

export function isCustomJerseyCategorySlug(slug: string | undefined): boolean {
  return slug === "custom-jersey";
}
