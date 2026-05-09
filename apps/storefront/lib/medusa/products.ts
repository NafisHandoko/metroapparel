import type { HttpTypes } from "@medusajs/types";

import { categorySlugToName, type Product } from "@/lib/data/site";
import { sdk } from "@/lib/medusa/config";
import { minMaxVariantPrices } from "@/lib/medusa/variant-picker";
import { defaultCountryCode, getRegion } from "@/lib/medusa/regions";

/**
 * Medusa: `*variants.calculated_price` di awal `fields` (tanpa sub-path seperti
 * `*.calculated_amount` — itu bukan relasi ORM dan memicu 500 di MikroORM populate).
 * Pakai `country_code` + `region_id` di query agar harga varian terisi.
 */
const PRODUCT_LIST_FIELDS =
  "*variants.calculated_price,*variants.options,+subtitle,*options,*options.values,*variants.images,+metadata,*categories,+tags,+images,+thumbnail";

const PRODUCT_DETAIL_FIELDS = PRODUCT_LIST_FIELDS;

export function mapStoreProductToProduct(p: HttpTypes.StoreProduct): Product | null {
  if (!p.id || !p.handle) return null;
  const { min } = minMaxVariantPrices(p.variants);
  const vCount = p.variants?.length ?? 0;
  if (vCount > 0 && min === null) {
    return null;
  }

  const cat = p.categories?.[0];
  const categorySlug = cat?.handle;
  const category =
    cat?.name ??
    (categorySlug ? categorySlugToName[categorySlug] : undefined) ??
    "Produk";
  const image =
    p.thumbnail ??
    p.images?.[0]?.url ??
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80";

  return {
    medusaProductId: p.id,
    handle: p.handle,
    name: p.title,
    category,
    categorySlug,
    image,
    description: p.description ?? "",
    minPriceIdr: min,
  };
}

export async function listMetroProducts(): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    console.warn(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is unset — katalog Medusa tidak dimuat.",
    );
    return [];
  }

  const region = await getRegion(defaultCountryCode());
  if (!region) {
    console.warn("Tidak ada region Medusa untuk negara default.");
    return [];
  }

  try {
    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[];
      count: number;
    }>("/store/products", {
      method: "GET",
      query: {
        region_id: region.id,
        country_code: defaultCountryCode(),
        limit: 100,
        fields: PRODUCT_LIST_FIELDS,
      },
      cache: "no-store",
    });

    return (products ?? [])
      .map(mapStoreProductToProduct)
      .filter((x): x is Product => x !== null);
  } catch (e) {
    console.error("Gagal memuat produk dari Medusa:", e);
    return [];
  }
}

export async function getMetroProductSummaryByHandle(
  handle: string,
): Promise<Product | null> {
  const raw = await getMetroProductByHandle(handle);
  return raw ? mapStoreProductToProduct(raw) : null;
}

export async function getMetroProductByHandle(
  handle: string,
): Promise<HttpTypes.StoreProduct | null> {
  if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    return null;
  }

  const region = await getRegion(defaultCountryCode());
  if (!region) return null;

  try {
    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[];
    }>("/store/products", {
      method: "GET",
      query: {
        region_id: region.id,
        country_code: defaultCountryCode(),
        handle,
        limit: 1,
        fields: PRODUCT_DETAIL_FIELDS,
      },
      cache: "no-store",
    });

    return products?.[0] ?? null;
  } catch {
    return null;
  }
}
