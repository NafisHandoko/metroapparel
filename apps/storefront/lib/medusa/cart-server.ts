import type { HttpTypes } from "@medusajs/types";

import { getCartId, removeCartId, setCartId } from "@/lib/cart/cart-cookie";
import { sdk } from "@/lib/medusa/config";
import { defaultCountryCode, getRegion } from "@/lib/medusa/regions";
import { metroVariantSku } from "@/lib/medusa/sku";

/**
 * Hanya modifier `+` di atas default Medusa. Daftar `*items,...,*region,...` memicu
 * `shouldReplaceDefaults` + strip prefix yang tidak menghapus `*`, sehingga token
 * seperti `*region` bisa lolos ke ORM (`Entity 'Cart' does not have property '*region'`).
 */
export const metroCartRetrieveFields = "+items.subtotal,+items.total";

export async function retrieveMetroCart(): Promise<HttpTypes.StoreCart | null> {
  if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) return null;
  const id = await getCartId();
  if (!id) return null;
  try {
    const { cart } = await sdk.store.cart.retrieve(id, {
      fields: metroCartRetrieveFields,
    });
    return cart ?? null;
  } catch {
    return null;
  }
}

export async function ensureMetroCart(): Promise<HttpTypes.StoreCart | null> {
  if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) return null;
  const region = await getRegion(defaultCountryCode());
  if (!region) return null;

  let cartId = await getCartId();
  if (cartId) {
    try {
      const { cart } = await sdk.store.cart.retrieve(cartId, {
        fields: "id,region_id",
      });
      if (cart) {
        if (cart.region_id !== region.id) {
          await sdk.store.cart.update(cartId, { region_id: region.id });
        }
        return (await sdk.store.cart.retrieve(cartId, {
          fields: metroCartRetrieveFields,
        })).cart;
      }
    } catch {
      await removeCartId();
      cartId = undefined;
    }
  }

  const { cart } = await sdk.store.cart.create(
    { region_id: region.id },
    { fields: metroCartRetrieveFields },
    {},
  );
  await setCartId(cart.id);
  return cart;
}

export async function addVariantToMetroCart(input: {
  productHandle: string;
  tierId: string;
  size: string;
  /** Stringified atau ringkas untuk admin / order detail */
  metadata: Record<string, string>;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    return { ok: false, message: "Publishable key Medusa belum diset." };
  }

  const region = await getRegion(defaultCountryCode());
  if (!region) {
    return { ok: false, message: "Region Medusa tidak ditemukan." };
  }

  const sku = metroVariantSku(input.productHandle, input.tierId);

  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[];
  }>("/store/products", {
    method: "GET",
    query: {
      region_id: region.id,
      handle: input.productHandle,
      limit: 1,
      fields: "+variants.id,+variants.sku",
    },
  });

  const product = products?.[0];
  const variant = product?.variants?.find((v) => (v.sku ?? "").toUpperCase() === sku);
  if (!variant?.id) {
    return {
      ok: false,
      message: `Varian tidak ditemukan (SKU: ${sku}). Pastikan paket di Admin sesuai seed / katalog.`,
    };
  }

  const cart = await ensureMetroCart();
  if (!cart) {
    return { ok: false, message: "Tidak bisa membuat keranjang." };
  }

  try {
    await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
      `/store/carts/${cart.id}/metro-line`,
      {
        method: "POST",
        body: {
          variant_id: variant.id,
          quantity: 1,
          metadata: input.metadata,
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e: unknown) {
    const msg =
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as { message: unknown }).message === "string"
        ? (e as { message: string }).message
        : String(e);
    return {
      ok: false,
      message: msg || "Gagal menambahkan ke keranjang (Metro line).",
    };
  }

  return { ok: true };
}

export async function removeMetroLineItem(lineId: string): Promise<void> {
  const cartId = await getCartId();
  if (!cartId) return;
  await sdk.store.cart.deleteLineItem(
    cartId,
    lineId,
    { fields: metroCartRetrieveFields },
    {},
  );
}
