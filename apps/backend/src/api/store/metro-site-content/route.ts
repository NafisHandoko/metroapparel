import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { getPrimaryStoreRow } from "../../../metro/metro-store-addons";
import { resolveMetroSiteContent } from "../../../metro/metro-site-content";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = await getPrimaryStoreRow(req.scope);
  if (!store) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No store found");
  }
  const content = resolveMetroSiteContent(store.metadata);
  res.status(200).json({ content });
}
