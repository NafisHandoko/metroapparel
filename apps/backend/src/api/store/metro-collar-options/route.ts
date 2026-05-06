import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { getResolvedCollarCatalogForProduct } from "../../../metro/metro-store-addons";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId =
    typeof req.query.product_id === "string" ? req.query.product_id : "";
  if (!productId.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Query parameter product_id is required.",
    );
  }

  const collars = await getResolvedCollarCatalogForProduct(
    req.scope,
    productId.trim(),
  );

  res.status(200).json({ collars });
}
