import {
  type MetroAddonScopeMode,
  scopeAppliesToProduct,
} from "./metro-addon-rules";
import { defaultCollarOptions, type CollarOption } from "./metro-pricing";

export const METRO_COLLAR_RULES_METADATA_KEY = "metro_collar_rules";

export type MetroCollarRuleEntry = {
  id: string;
  label: string;
  surcharge: number;
  scope: MetroAddonScopeMode;
  product_ids: string[];
};

export type MetroCollarRulesPayload = {
  version: 1;
  entries: MetroCollarRuleEntry[];
};

export function rulesToCollarOptionsForProduct(
  productId: string,
  entries: MetroCollarRuleEntry[],
): CollarOption[] {
  const out: CollarOption[] = [];
  for (const e of entries) {
    if (!scopeAppliesToProduct(productId, e.scope, e.product_ids)) continue;
    out.push({
      id: e.id,
      label: e.label,
      surcharge: e.surcharge,
    });
  }
  return out;
}

export function parseMetroCollarRulesPayload(
  raw: unknown,
): MetroCollarRulesPayload | null {
  if (raw == null || raw === "") return null;
  let parsed: unknown;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  } else if (typeof raw === "object") {
    parsed = raw;
  } else {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (o.version !== 1) return null;
  const entriesRaw = o.entries;
  if (!Array.isArray(entriesRaw)) return null;
  const entries: MetroCollarRuleEntry[] = [];
  for (const row of entriesRaw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id.trim()) continue;
    if (typeof r.label !== "string") continue;
    if (typeof r.surcharge !== "number" || Number.isNaN(r.surcharge)) continue;
    const scope = r.scope;
    if (scope !== "all" && scope !== "only" && scope !== "except") continue;
    const productIds = Array.isArray(r.product_ids)
      ? r.product_ids.filter((x): x is string => typeof x === "string")
      : [];
    entries.push({
      id: r.id.trim(),
      label: r.label,
      surcharge: r.surcharge,
      scope,
      product_ids: productIds,
    });
  }
  return entries.length ? { version: 1, entries } : null;
}

export function serializeMetroCollarRulesPayload(
  payload: MetroCollarRulesPayload,
): string {
  return JSON.stringify(payload);
}

export function defaultMetroCollarRulesPayload(): MetroCollarRulesPayload {
  return {
    version: 1,
    entries: defaultCollarOptions.map((c) => ({
      id: c.id,
      label: c.label,
      surcharge: c.surcharge,
      scope: "all" as const,
      product_ids: [],
    })),
  };
}
