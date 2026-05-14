"use server";

import type { HttpTypes } from "@medusajs/types";

import { removeCartId } from "@/lib/cart/cart-cookie";
import { sdk } from "@/lib/medusa/config";
import { metroCartRetrieveFields, retrieveMetroCart } from "@/lib/medusa/cart-server";

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return String(e);
}

export type MetroCheckoutAddressInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  city: string;
  postal_code: string;
};

/** Ringkas untuk UI pilih kirim vs pickup (harga dari Medusa untuk cart saat ini). */
export type MetroShippingOptionChoice = {
  id: string;
  name: string;
  amount: number | null;
};

/** Setelah alamat diisi: perbarui cart & kembalikan opsi ongkir/pickup tanpa menyelesaikan checkout. */
export async function previewMetroShippingOptions(
  input: MetroCheckoutAddressInput,
): Promise<
  { ok: true; options: MetroShippingOptionChoice[] } | { ok: false; message: string }
> {
  try {
    const cart = await retrieveMetroCart();
    if (!cart?.id) {
      return { ok: false, message: "Keranjang kosong atau tidak ditemukan." };
    }

    const country = "id";

    await sdk.store.cart.update(
      cart.id,
      {
        email: input.email,
        shipping_address: {
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          address_1: input.address_1,
          city: input.city,
          postal_code: input.postal_code,
          country_code: country,
        },
        billing_address: {
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          address_1: input.address_1,
          city: input.city,
          postal_code: input.postal_code,
          country_code: country,
        },
      },
      { fields: metroCartRetrieveFields },
      {},
    );

    const { shipping_options } = await sdk.client.fetch<{
      shipping_options: HttpTypes.StoreCartShippingOption[];
    }>("/store/shipping-options", {
      method: "GET",
      query: { cart_id: cart.id },
    });

    const raw = shipping_options ?? [];
    const options: MetroShippingOptionChoice[] = raw.map((o) => {
      const amount =
        typeof (o as { amount?: unknown }).amount === "number"
          ? (o as { amount: number }).amount
          : typeof (o as { calculated_price?: { calculated_amount?: unknown } })
                .calculated_price?.calculated_amount === "number"
            ? (o as { calculated_price: { calculated_amount: number } }).calculated_price
                .calculated_amount
            : null;
      return {
        id: o.id,
        name: o.name ?? "Pengiriman",
        amount,
      };
    });

    if (!options.length) {
      return {
        ok: false,
        message:
          "Belum ada opsi pengiriman untuk alamat ini. Periksa region keranjang atau hubungi admin.",
      };
    }

    return { ok: true, options };
  } catch (e) {
    return { ok: false, message: errMsg(e) };
  }
}

export type MetroPrepareCheckoutInput = MetroCheckoutAddressInput & {
  /** Wajib jika API mengembalikan lebih dari satu opsi (mis. reguler + pickup). */
  shipping_option_id?: string;
};

export async function prepareMetroCheckout(
  input: MetroPrepareCheckoutInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const cart = await retrieveMetroCart();
    if (!cart?.id) {
      return { ok: false, message: "Keranjang kosong atau tidak ditemukan." };
    }

    const country = "id";

    await sdk.store.cart.update(
      cart.id,
      {
        email: input.email,
        shipping_address: {
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          address_1: input.address_1,
          city: input.city,
          postal_code: input.postal_code,
          country_code: country,
        },
        billing_address: {
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          address_1: input.address_1,
          city: input.city,
          postal_code: input.postal_code,
          country_code: country,
        },
      },
      { fields: metroCartRetrieveFields },
      {},
    );

    const { shipping_options } = await sdk.client.fetch<{
      shipping_options: HttpTypes.StoreCartShippingOption[];
    }>("/store/shipping-options", {
      method: "GET",
      query: { cart_id: cart.id },
    });

    const list = shipping_options ?? [];
    const chosenId =
      input.shipping_option_id &&
      list.some((o) => o.id === input.shipping_option_id)
        ? input.shipping_option_id
        : list.length === 1
          ? list[0]!.id
          : undefined;

    if (!chosenId) {
      return {
        ok: false,
        message:
          list.length > 1
            ? "Pilih salah satu: pengiriman atau pickup, lalu coba lagi."
            : "Metode pengiriman belum terpasang. Periksa alamat atau hubungi admin (opsi pengiriman region).",
      };
    }

    await sdk.store.cart.addShippingMethod(
      cart.id,
      { option_id: chosenId },
      { fields: metroCartRetrieveFields },
      {},
    );

    const refreshed = (await sdk.store.cart.retrieve(cart.id, { fields: metroCartRetrieveFields }))
      .cart;

    if (!refreshed?.shipping_methods?.length) {
      return {
        ok: false,
        message:
          "Metode pengiriman belum terpasang. Periksa alamat atau hubungi admin (opsi pengiriman region).",
      };
    }

    const regionId = refreshed.region_id ?? refreshed.region?.id;
    if (!regionId) {
      return { ok: false, message: "Keranjang tidak memiliki region toko." };
    }

    const { payment_providers } = await sdk.client.fetch<{
      payment_providers: { id: string }[];
    }>("/store/payment-providers", {
      method: "GET",
      query: { region_id: regionId },
    });

    const providers = payment_providers ?? [];
    const system = providers.find((p) => p.id === "pp_system_default");
    const providerId = system?.id ?? providers[0]?.id;

    if (!providerId) {
      return {
        ok: false,
        message:
          "Tidak ada penyedia pembayaran untuk region ini. Di Medusa Admin, pastikan region Indonesia punya payment provider (mis. System Default).",
      };
    }

    // Jangan kirim `fields` di query POST — refetch server memakai fields itu pada entitas
    // `payment_collection`; pola seperti `*payment_collection.*` dari cart bisa memicu 500.
    await sdk.store.payment.initiatePaymentSession(
      refreshed,
      { provider_id: providerId, data: {} },
      undefined,
      {},
    );

    return { ok: true };
  } catch (e) {
    return { ok: false, message: errMsg(e) };
  }
}

export async function completeMetroOrder(): Promise<
  { ok: true; orderId: string } | { ok: false; message: string }
> {
  try {
    const cart = await retrieveMetroCart();
    if (!cart?.id) {
      return { ok: false, message: "Keranjang tidak ditemukan." };
    }

    const result = (await sdk.store.cart.complete(cart.id, {}, {})) as {
      type?: string;
      order?: { id: string };
      cart?: HttpTypes.StoreCart;
      error?: { message?: string };
    };

    if (result.type === "order" && result.order?.id) {
      await removeCartId();
      return { ok: true, orderId: result.order.id };
    }

    if (result.type === "cart") {
      return {
        ok: false,
        message:
          result.error?.message ??
          "Checkout belum selesai. Pastikan ongkir & pembayaran, atau hubungi admin.",
      };
    }

    return {
      ok: false,
      message:
        "Checkout belum selesai (mis. pembayaran). Coba lagi atau gunakan WhatsApp.",
    };
  } catch (e) {
    return { ok: false, message: errMsg(e) };
  }
}
