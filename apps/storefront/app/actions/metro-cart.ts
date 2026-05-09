"use server";

import { revalidatePath } from "next/cache";

import { addMetroConfiguratorLineToCart, removeMetroLineItem } from "@/lib/medusa/cart-server";

export async function addMetroConfiguratorToCartAction(input: {
  productHandle: string;
  variantId: string;
  metadata: Record<string, string>;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await addMetroConfiguratorLineToCart(input);
  if (result.ok) {
    revalidatePath("/", "layout");
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
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
