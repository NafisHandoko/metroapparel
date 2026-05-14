/**
 * Detail bullet per **nilai opsi** (mis. Essential / Elite / Prime), disimpan di
 * `product.metadata.metro_option_details_json` lewat widget Admin — bukan hardcode.
 */

export type MetroOptionDetailsV1 = {
  v: 1;
  /** `option_id` Medusa → nilai opsi (string) → baris bullet */
  byOption: Record<string, Record<string, string[]>>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function parseMetroOptionDetailsFromMetadata(
  metadata?: Record<string, unknown> | null,
): MetroOptionDetailsV1 | null {
  const raw = metadata?.metro_option_details_json;
  if (raw == null || raw === "") return null;
  let parsed: unknown;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  if (parsed.v !== 1) return null;
  const byOption = parsed.byOption;
  if (!isRecord(byOption)) return null;

  const out: MetroOptionDetailsV1["byOption"] = {};
  for (const [optId, inner] of Object.entries(byOption)) {
    if (!isRecord(inner)) continue;
    const m: Record<string, string[]> = {};
    for (const [val, lines] of Object.entries(inner)) {
      if (!Array.isArray(lines)) continue;
      const cleaned = lines
        .filter((x): x is string => typeof x === "string")
        .map((s) => s.trim())
        .filter(Boolean);
      if (cleaned.length) m[val] = cleaned;
    }
    if (Object.keys(m).length) out[optId] = m;
  }
  return Object.keys(out).length ? { v: 1, byOption: out } : null;
}

export function metroBulletsForOptionValue(
  doc: MetroOptionDetailsV1 | null,
  optionId: string,
  value: string,
): string[] {
  if (!doc?.byOption) return [];
  const inner = doc.byOption[optionId];
  if (!inner) return [];
  const direct = inner[value];
  if (direct?.length) return direct;
  return [];
}
