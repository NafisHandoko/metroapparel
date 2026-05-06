import { defaultAdditionalOptions, type AdditionalOption } from "./metro-pricing";

/** Store metadata key — edited via Admin UI, not raw JSON by merchants. */
export const METRO_ADDON_RULES_METADATA_KEY = "metro_addon_rules";

export type MetroAddonScopeMode = "all" | "only" | "except";

/**
 * One add-on row with optional product filter.
 * Default: `scope: "all"` → applies to every product with `metro_kind`.
 */
export type MetroAddonRuleEntry = {
  id: string;
  label: string;
  description?: string;
  price: number;
  input?: "quantity";
  group?: "fabric-extra";
  scope: MetroAddonScopeMode;
  /** Medusa product ids — used when scope is `only` or `except`. */
  product_ids: string[];
};

export type MetroAddonRulesPayload = {
  version: 1;
  entries: MetroAddonRuleEntry[];
};

export function scopeAppliesToProduct(
  productId: string,
  scope: MetroAddonScopeMode,
  productIds: string[],
): boolean {
  if (scope === "all") return true;
  const set = new Set(productIds.filter(Boolean));
  if (scope === "only") return set.has(productId);
  if (scope === "except") {
    if (set.size === 0) return true;
    return !set.has(productId);
  }
  return true;
}

export function entryAppliesToProduct(
  entry: MetroAddonRuleEntry,
  productId: string,
): boolean {
  return scopeAppliesToProduct(productId, entry.scope, entry.product_ids);
}

export function rulesToAdditionalOptionsForProduct(
  productId: string,
  entries: MetroAddonRuleEntry[],
): AdditionalOption[] {
  const out: AdditionalOption[] = [];
  for (const e of entries) {
    if (!entryAppliesToProduct(e, productId)) continue;
    out.push({
      id: e.id,
      label: e.label,
      description: e.description,
      price: e.price,
      input: e.input,
      group: e.group,
    });
  }
  return out;
}

export function parseMetroAddonRulesPayload(
  raw: unknown,
): MetroAddonRulesPayload | null {
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
  const entries: MetroAddonRuleEntry[] = [];
  for (const row of entriesRaw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id.trim()) continue;
    if (typeof r.label !== "string") continue;
    if (typeof r.price !== "number" || Number.isNaN(r.price)) continue;
    const scope = r.scope;
    if (scope !== "all" && scope !== "only" && scope !== "except") continue;
    const productIds = Array.isArray(r.product_ids)
      ? r.product_ids.filter((x): x is string => typeof x === "string")
      : [];
    entries.push({
      id: r.id.trim(),
      label: r.label,
      description: typeof r.description === "string" ? r.description : undefined,
      price: r.price,
      input: r.input === "quantity" ? "quantity" : undefined,
      group: r.group === "fabric-extra" ? "fabric-extra" : undefined,
      scope,
      product_ids: productIds,
    });
  }
  return entries.length ? { version: 1, entries } : null;
}

export function serializeMetroAddonRulesPayload(
  payload: MetroAddonRulesPayload,
): string {
  return JSON.stringify(payload);
}

/** Seed / reset: every add-on applies to all products. */
export function defaultMetroAddonRulesPayload(): MetroAddonRulesPayload {
  return {
    version: 1,
    entries: defaultAdditionalOptions.map((o) => ({
      id: o.id,
      label: o.label,
      description: o.description,
      price: o.price,
      input: o.input,
      group: o.group,
      scope: "all" as const,
      product_ids: [],
    })),
  };
}
