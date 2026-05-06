import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  METRO_ADDON_RULES_METADATA_KEY,
  parseMetroAddonRulesPayload,
  rulesToAdditionalOptionsForProduct,
} from "./metro-addon-rules";
import type { AdditionalOption } from "./metro-pricing";
import { defaultAdditionalOptions } from "./metro-pricing";

/** Samakan dengan nama store di seed (`initial-data-seed`). */
const METRO_STORE_NAME = "Metro Apparel";

export type PrimaryStoreRow = {
  id: string;
  metadata: Record<string, unknown> | null;
};

export async function getPrimaryStoreRow(
  container: MedusaContainer,
): Promise<PrimaryStoreRow | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "metadata", "name"],
    filters: {},
    pagination: { take: 50, skip: 0 },
  });
  const list = (stores ?? []) as {
    id?: string;
    metadata?: Record<string, unknown> | null;
    name?: string;
  }[];
  const row =
    list.find((s) => s.name === METRO_STORE_NAME) ?? list[0];
  if (!row?.id) return null;
  return {
    id: row.id,
    metadata:
      row.metadata && typeof row.metadata === "object" ? row.metadata : null,
  };
}

export async function getPrimaryStoreMetadata(
  container: MedusaContainer,
): Promise<Record<string, unknown> | null> {
  const row = await getPrimaryStoreRow(container);
  return row?.metadata ?? null;
}

/** Add-on list for a product: global store rules + scope, else code defaults. */
export async function getResolvedAddonCatalogForProduct(
  container: MedusaContainer,
  productId: string,
): Promise<AdditionalOption[]> {
  const metadata = await getPrimaryStoreMetadata(container);
  const raw = metadata?.[METRO_ADDON_RULES_METADATA_KEY];
  const parsed = parseMetroAddonRulesPayload(raw);
  if (!parsed?.entries.length) {
    return defaultAdditionalOptions;
  }
  const filtered = rulesToAdditionalOptionsForProduct(
    productId,
    parsed.entries,
  );
  return filtered.length ? filtered : defaultAdditionalOptions;
}
