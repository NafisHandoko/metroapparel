import { updateStoresWorkflow } from "@medusajs/core-flows";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { getPrimaryStoreRow } from "../../../metro/metro-store-addons";
import {
  METRO_SITE_HERO_METADATA_KEY,
  isMetroSiteHeroSectionDefault,
  metroSiteHeroPostSchema,
  resolveMetroSiteContent,
  serializeMetroSiteHero,
} from "../../../metro/metro-site-content";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = await getPrimaryStoreRow(req.scope);
  if (!store) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No store found");
  }
  const content = resolveMetroSiteContent(store.metadata);
  res.status(200).json({
    store_id: store.id,
    urls: content.heroBackgroundUrls,
    is_default_template: isMetroSiteHeroSectionDefault(store.metadata),
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = metroSiteHeroPostSchema.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldMsg = Object.entries(flat.fieldErrors)
      .map(([k, v]) => `${k}: ${(v ?? []).join(", ")}`)
      .join("; ");
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      [flat.formErrors.join("; "), fieldMsg].filter(Boolean).join(" — ") ||
        "Invalid body",
    );
  }

  const store = await getPrimaryStoreRow(req.scope);
  if (!store) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No store found");
  }

  const mergedMetadata = {
    ...(store.metadata ?? {}),
    [METRO_SITE_HERO_METADATA_KEY]: serializeMetroSiteHero(parsed.data.urls),
  };

  await updateStoresWorkflow(req.scope).run({
    input: {
      selector: { id: store.id },
      update: { metadata: mergedMetadata },
    },
  });

  const content = resolveMetroSiteContent(mergedMetadata);
  res.status(200).json({ ok: true, urls: content.heroBackgroundUrls });
}
