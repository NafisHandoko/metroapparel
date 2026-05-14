import {
  additionalOptions as fallbackAdditionalOptions,
  type AdditionalOption,
} from "@/lib/data/catalog";
import { sdk } from "@/lib/medusa/config";

export async function getMetroAddonOptionsForProduct(
  productId: string,
): Promise<AdditionalOption[]> {
  if (!productId || !process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    return fallbackAdditionalOptions;
  }
  try {
    const res = await sdk.client.fetch<{ addons: AdditionalOption[] }>(
      "/store/metro-addon-catalog",
      {
        method: "GET",
        query: { product_id: productId },
        cache: "no-store",
      },
    );
    return res.addons?.length ? res.addons : fallbackAdditionalOptions;
  } catch {
    return fallbackAdditionalOptions;
  }
}
