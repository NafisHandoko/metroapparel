import {
  collarOptions as fallbackCollarOptions,
  type CollarOption,
} from "@/lib/data/catalog";
import { sdk } from "@/lib/medusa/config";

export async function getMetroCollarOptionsForProduct(
  productId: string,
): Promise<CollarOption[]> {
  if (!productId || !process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    return fallbackCollarOptions;
  }
  try {
    const res = await sdk.client.fetch<{ collars: CollarOption[] }>(
      "/store/metro-collar-options",
      {
        method: "GET",
        query: { product_id: productId },
        cache: "no-store",
      },
    );
    return res.collars?.length ? res.collars : fallbackCollarOptions;
  } catch {
    return fallbackCollarOptions;
  }
}
