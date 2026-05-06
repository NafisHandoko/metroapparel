import { updateStoresWorkflow } from "@medusajs/core-flows";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { z } from "zod";

import {
  METRO_ADDON_RULES_METADATA_KEY,
  type MetroAddonRulesPayload,
  defaultMetroAddonRulesPayload,
  parseMetroAddonRulesPayload,
  serializeMetroAddonRulesPayload,
} from "../../../metro/metro-addon-rules";
import { getPrimaryStoreRow } from "../../../metro/metro-store-addons";

const EntrySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  price: z.number(),
  input: z.enum(["quantity"]).optional(),
  group: z.enum(["fabric-extra"]).optional(),
  scope: z.enum(["all", "only", "except"]),
  product_ids: z.array(z.string()).default([]),
});

const PostBodySchema = z.object({
  entries: z.array(EntrySchema),
});

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = await getPrimaryStoreRow(req.scope);
  if (!store) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No store found");
  }
  const raw = store.metadata?.[METRO_ADDON_RULES_METADATA_KEY];
  const parsed = parseMetroAddonRulesPayload(raw);
  const hasSaved = Boolean(parsed?.entries?.length);
  const entries = hasSaved
    ? parsed!.entries
    : defaultMetroAddonRulesPayload().entries;
  res.status(200).json({
    store_id: store.id,
    entries,
    is_default_template: !hasSaved,
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = PostBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.flatten().formErrors.join("; ") || "Invalid body",
    );
  }

  const ids = parsed.data.entries.map((e) => e.id);
  if (new Set(ids).size !== ids.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Duplicate add-on id values are not allowed.",
    );
  }

  const store = await getPrimaryStoreRow(req.scope);
  if (!store) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No store found");
  }

  const payload: MetroAddonRulesPayload = {
    version: 1,
    entries: parsed.data.entries.map((e) => ({
      id: e.id.trim(),
      label: e.label,
      description: e.description,
      price: e.price,
      input: e.input,
      group: e.group,
      scope: e.scope,
      product_ids: e.product_ids ?? [],
    })),
  };

  const mergedMetadata = {
    ...(store.metadata ?? {}),
    [METRO_ADDON_RULES_METADATA_KEY]:
      serializeMetroAddonRulesPayload(payload),
  };

  await updateStoresWorkflow(req.scope).run({
    input: {
      selector: { id: store.id },
      update: { metadata: mergedMetadata },
    },
  });

  res.status(200).json({ ok: true, entries: payload.entries });
}
