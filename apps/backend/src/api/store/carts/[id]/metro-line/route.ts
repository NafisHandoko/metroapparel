import { addToCartWorkflowId } from "@medusajs/core-flows";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import { defaultStoreCartFields } from "@medusajs/medusa/api/store/carts/query-config";
import { refetchCart } from "@medusajs/medusa/api/store/carts/helpers";
import { z } from "zod";

import {
  computeMetroLineFromMetadata,
  parseProductKind,
} from "../../../../../metro/metro-pricing";
import { metroVariantSku } from "../../../../../metro/metro-variant-sku";
import { getResolvedAddonCatalogForProduct } from "../../../../../metro/metro-store-addons";

/** `defaultStoreCartFields` includes `*region.countries`, `*payment_collection`, … for HTTP `FieldParser`. `refetchCart` passes `fields` straight to remote query and must not include those `*` entries. */
const metroLineRefetchCartFields = defaultStoreCartFields.filter(
  (field) => !field.startsWith("*"),
);

const BodySchema = z.object({
  variant_id: z.string().min(1),
  quantity: z.number().int().positive().optional().default(1),
  metadata: z.record(z.string(), z.string()),
});

type VariantRow = { id: string; sku?: string | null; product_id?: string | null };
type ProductRow = { id: string; metadata?: Record<string, unknown> | null };

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.params.id as string;
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.flatten().formErrors.join("; ") || "Invalid body",
    );
  }
  const body = parsed.data;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id"],
    filters: { id: cartId },
  });
  if (!carts?.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Cart '${cartId}' not found`,
    );
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "product_id"],
    filters: { id: body.variant_id },
  });
  const variant = variants?.[0] as VariantRow | undefined;
  if (!variant?.product_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Variant not found",
    );
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "metadata"],
    filters: { id: variant.product_id },
  });
  const product = products?.[0] as ProductRow | undefined;
  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found");
  }

  const handle =
    typeof body.metadata.product_handle === "string"
      ? body.metadata.product_handle
      : "";
  const tierId =
    typeof body.metadata.tier_id === "string" ? body.metadata.tier_id : "";
  const size = typeof body.metadata.size === "string" ? body.metadata.size : "";
  const expectedSku = metroVariantSku(handle, tierId, size);
  if (
    !variant.sku ||
    variant.sku.toUpperCase() !== expectedSku.toUpperCase()
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Varian tidak cocok dengan konfigurasi (SKU).",
    );
  }

  const kind = parseProductKind(product.metadata?.metro_kind);
  if (!kind) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Produk tidak punya metro_kind di metadata Admin.",
    );
  }

  const addonCatalog = await getResolvedAddonCatalogForProduct(
    req.scope,
    product.id,
  );

  const { total, breakdown } = computeMetroLineFromMetadata(
    kind,
    body.metadata,
    addonCatalog,
  );
  if (total <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Tidak bisa menghitung harga baris.",
    );
  }

  const clientTotal = Number.parseInt(
    body.metadata.estimated_total_idr ?? "",
    10,
  );
  if (Number.isNaN(clientTotal) || clientTotal !== total) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Total harga tidak sinkron. Muat ulang halaman produk dan coba lagi.",
    );
  }

  const enrichedMetadata: Record<string, string> = {
    ...body.metadata,
    metro_price_breakdown: JSON.stringify(breakdown),
  };

  const compareAt =
    breakdown[0]?.label?.startsWith("Paket") && typeof breakdown[0]?.amount === "number"
      ? breakdown[0].amount
      : total;

  const we = req.scope.resolve(Modules.WORKFLOW_ENGINE);
  await we.run(addToCartWorkflowId, {
    input: {
      cart_id: cartId,
      items: [
        {
          variant_id: body.variant_id,
          quantity: body.quantity,
          metadata: enrichedMetadata,
          unit_price: total,
          compare_at_unit_price: compareAt,
          is_custom_price: true,
        },
      ],
    },
  });

  const cart = await refetchCart(cartId, req.scope, metroLineRefetchCartFields);
  res.status(200).json({ cart });
}
