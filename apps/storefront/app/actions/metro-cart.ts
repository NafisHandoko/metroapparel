"use server";

import { revalidatePath } from "next/cache";

import { addVariantToMetroCart, removeMetroLineItem } from "@/lib/medusa/cart-server";

export async function addConfiguratorToCartAction(input: {
  productHandle: string;
  tierId: string;
  size: string;
  metadata: Record<string, string>;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await addVariantToMetroCart(input);
  if (result.ok) {
    revalidatePath("/cart");
    revalidatePath(`/products/${input.productHandle}`);
  }
  return result;
}

export async function removeCartLineAction(
  lineId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await removeMetroLineItem(lineId);
    revalidatePath("/cart");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
