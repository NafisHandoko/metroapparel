import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  Button,
  Container,
  Heading,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

/** Sama dengan `apps/storefront/lib/medusa/metro-option-details.ts` — jangan ubah bentuk tanpa sinkron. */
const METRO_OPTION_DETAILS_KEY = "metro_option_details_json";

type MetroOptionDetailsV1 = {
  v: 1;
  byOption: Record<string, Record<string, string[]>>;
};

type ProductOptionValue = { id: string; value: string };
type ProductOption = {
  id: string;
  title?: string | null;
  values?: ProductOptionValue[];
};

type AdminProductLike = {
  id: string;
  title?: string | null;
  metadata?: Record<string, unknown> | null;
  options?: ProductOption[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseDetailsFromMetadata(
  metadata?: Record<string, unknown> | null,
): MetroOptionDetailsV1 | null {
  const raw = metadata?.[METRO_OPTION_DETAILS_KEY];
  if (raw == null || raw === "") return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!isRecord(parsed) || parsed.v !== 1) return null;
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
  } catch {
    return null;
  }
}

/** `optionId` → `value` → teks textarea (satu bullet per baris). */
function detailsToTextMap(
  doc: MetroOptionDetailsV1 | null,
  options: ProductOption[],
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const opt of options) {
    const inner: Record<string, string> = {};
    for (const v of opt.values ?? []) {
      const lines = doc?.byOption?.[opt.id]?.[v.value] ?? [];
      inner[v.value] = lines.join("\n");
    }
    if (Object.keys(inner).length) out[opt.id] = inner;
  }
  return out;
}

function textMapToDetails(
  textMap: Record<string, Record<string, string>>,
): MetroOptionDetailsV1 {
  const byOption: MetroOptionDetailsV1["byOption"] = {};
  for (const [optId, inner] of Object.entries(textMap)) {
    const m: Record<string, string[]> = {};
    for (const [val, raw] of Object.entries(inner)) {
      const lines = raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length) m[val] = lines;
    }
    if (Object.keys(m).length) byOption[optId] = m;
  }
  return { v: 1, byOption };
}

const ProductMetroOptionDetailsWidget = ({
  data,
}: {
  data: AdminProductLike;
}) => {
  const productId = data.id;
  const queryClient = useQueryClient();

  const { data: loaded, isLoading } = useQuery({
    queryKey: ["admin-product-metro-option-details", productId],
    queryFn: async () => {
      const params = new URLSearchParams({
        fields: "id,metadata,*options,*options.values",
      });
      const res = await fetch(`/admin/products/${productId}?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const body = (await res.json()) as { product?: AdminProductLike };
      return body.product ?? null;
    },
    enabled: Boolean(productId),
  });

  const options = loaded?.options ?? data.options ?? [];
  const [textMap, setTextMap] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const doc = parseDetailsFromMetadata(loaded.metadata ?? null);
    setTextMap(detailsToTextMap(doc, loaded.options ?? []));
  }, [loaded]);

  const patchText = useCallback(
    (optionId: string, value: string, text: string) => {
      setTextMap((prev) => ({
        ...prev,
        [optionId]: { ...(prev[optionId] ?? {}), [value]: text },
      }));
    },
    [],
  );

  const hasOptions = options.some((o) => (o.values ?? []).length > 0);

  const save = async () => {
    const doc = textMapToDetails(textMap);
    const json =
      Object.keys(doc.byOption).length === 0
        ? ""
        : JSON.stringify(doc);

    setSaving(true);
    try {
      const fresh = await fetch(
        `/admin/products/${productId}?fields=id,metadata`,
        { credentials: "include" },
      );
      if (!fresh.ok) throw new Error(await fresh.text());
      const body = (await fresh.json()) as { product?: AdminProductLike };
      const prevMeta = (body.product?.metadata ?? {}) as Record<
        string,
        unknown
      >;
      const nextMeta = { ...prevMeta } as Record<string, unknown>;
      if (json) nextMeta[METRO_OPTION_DETAILS_KEY] = json;
      else delete nextMeta[METRO_OPTION_DETAILS_KEY];

      const res = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: nextMeta }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Detail opsi untuk storefront disimpan.");
      await queryClient.invalidateQueries({
        queryKey: ["admin-product-metro-option-details", productId],
      });
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan. Periksa konsol / respons server.");
    } finally {
      setSaving(false);
    }
  };

  const dirtyHint = useMemo(() => {
    if (!hasOptions) return null;
    return "Satu baris = satu poin di storefront. Kosongkan semua lalu simpan untuk menghapus.";
  }, [hasOptions]);

  return (
    <Container className="divide-y p-0 rounded-lg border border-ui-border-base bg-ui-bg-base shadow-elevation-card-rest">
      <div className="px-6 py-4">
        <Heading level="h2" className="txt-compact-large font-sans font-medium">
          Metro — detail per nilai opsi (storefront)
        </Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1 max-w-2xl">
          Isi poin untuk tiap nilai opsi (mis. Essential, Elite). Tampil di halaman
          produk toko di bawah nama & harga opsi. Tidak perlu metadata manual di
          editor JSON — cukup form ini.
        </Text>
      </div>

      <div className="px-6 py-5 space-y-8">
        {isLoading ? (
          <Text size="small" className="text-ui-fg-muted">
            Memuat opsi produk…
          </Text>
        ) : !hasOptions ? (
          <Text size="small" className="text-ui-fg-muted">
            Produk ini belum punya opsi / nilai opsi. Tambahkan opsi & varian di
            tab Medusa dulu.
          </Text>
        ) : (
          options.map((opt) => {
            const vals = opt.values ?? [];
            if (!vals.length) return null;
            return (
              <div key={opt.id} className="space-y-4">
                <Heading level="h3" className="text-ui-fg-base text-sm font-medium">
                  {opt.title ?? "Opsi"}
                </Heading>
                <div className="grid gap-4">
                  {vals.map((v) => (
                    <div key={v.id} className="space-y-2">
                      <Label htmlFor={`${opt.id}-${v.id}`} className="text-ui-fg-subtle">
                        Nilai: <span className="text-ui-fg-base">{v.value}</span>
                      </Label>
                      <Textarea
                        id={`${opt.id}-${v.id}`}
                        rows={5}
                        value={textMap[opt.id]?.[v.value] ?? ""}
                        onChange={(e) =>
                          patchText(opt.id, v.value, e.target.value)
                        }
                        placeholder={"Contoh:\nAtasan print depan\nLogo & nomor punggung"}
                        className="font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {dirtyHint ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            {dirtyHint}
          </Text>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="primary"
            disabled={saving || isLoading || !hasOptions}
            onClick={() => void save()}
          >
            {saving ? "Menyimpan…" : "Simpan ke produk"}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductMetroOptionDetailsWidget;
