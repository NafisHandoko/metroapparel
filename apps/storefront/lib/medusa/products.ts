import type { HttpTypes } from "@medusajs/types";

import {
  parseProductKind,
  shopCategorySlugForKind,
} from "@/lib/data/catalog";
import { categorySlugToName, type Product } from "@/lib/data/site";
import { sdk } from "@/lib/medusa/config";
import { defaultCountryCode, getRegion } from "@/lib/medusa/regions";

/**
 * `*categories` (bukan `+categories`) agar relasi diekspansi penuh ke Store API —
 * jika tidak, `categories[0].handle` sering kosong dan filter halaman kategori toko gagal.
 */
const PRODUCT_FIELDS =
  "*variants.calculated_price,*variants.images,+metadata,*categories,+tags,+images,+thumbnail";

function mapStoreProductToProduct(p: HttpTypes.StoreProduct): Product | null {
  const kind = parseProductKind(p.metadata?.metro_kind);
  if (!kind) return null;

  const cat = p.categories?.[0];
  const fallbackSlug = shopCategorySlugForKind(kind);
  const categorySlug = cat?.handle ?? fallbackSlug;
  const category =
    cat?.name ?? categorySlugToName[categorySlug] ?? "Produk";
  const image =
    p.thumbnail ??
    p.images?.[0]?.url ??
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80";

  return {
    medusaProductId: p.id ?? "",
    handle: p.handle ?? "",
    name: p.title,
    category,
    categorySlug,
    image,
    description: p.description ?? "",
    kind,
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
        limit: 100,
        fields: PRODUCT_FIELDS,
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
        handle,
        limit: 1,
        fields: PRODUCT_FIELDS,
      },
      cache: "no-store",
    });

    return products?.[0] ?? null;
  } catch {
    return null;
  }
}
