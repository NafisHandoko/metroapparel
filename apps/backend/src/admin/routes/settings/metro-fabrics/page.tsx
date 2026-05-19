import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Swatch } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

type ScopeMode = "all" | "only" | "except";

const PRODUCT_SCOPE_OPTIONS: { value: ScopeMode; label: string }[] = [
  { value: "all", label: "Semua produk (default)" },
  { value: "only", label: "Hanya produk terpilih" },
  { value: "except", label: "Semua kecuali produk terpilih" },
];

type LinkedProduct = { id: string; title: string };

type FabricForm = {
  id: string;
  label: string;
  description: string;
  price: string;
  scope: ScopeMode;
  linked_products: LinkedProduct[];
};

type ApiEntry = {
  id: string;
  label: string;
  description?: string;
  price: number;
  input?: "quantity";
  group?: "fabric-extra";
  scope: ScopeMode;
  product_ids: string[];
};

const emptyFabric = (): FabricForm => ({
  id: "",
  label: "",
  description: "",
  price: "0",
  scope: "all",
  linked_products: [],
});

function apiEntryToForm(e: ApiEntry): FabricForm {
  return {
    id: e.id,
    label: e.label,
    description: e.description ?? "",
    price: String(e.price),
    scope: e.scope,
    linked_products: (e.product_ids ?? []).map((id) => ({
      id,
      title: id.length > 14 ? `${id.slice(0, 10)}…` : id,
    })),
  };
}

function formToPayload(fabrics: FabricForm[]) {
  return fabrics.map((row) => {
    const price = Number.parseInt(row.price.replace(/\s/g, ""), 10);
    return {
      id: row.id.trim(),
      label: row.label.trim(),
      description: row.description.trim() || undefined,
      price: Number.isFinite(price) ? price : 0,
      input: undefined,
      group: "fabric-extra" as const,
      scope: row.scope,
      product_ids: row.linked_products.map((p) => p.id),
    };
  });
}

const MetroFabricsSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fabrics, setFabrics] = useState<FabricForm[]>([]);
  const [otherAddons, setOtherAddons] = useState<ApiEntry[]>([]);
  const [searchRow, setSearchRow] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-addon-catalog", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { entries: ApiEntry[] };
      const all = data.entries ?? [];
      const fabricEntries = all.filter((e) => e.group === "fabric-extra");
      const nonFabricEntries = all.filter((e) => e.group !== "fabric-extra");
      setFabrics(
        fabricEntries.length
          ? fabricEntries.map(apiEntryToForm)
          : [emptyFabric()],
      );
      setOtherAddons(nonFabricEntries);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat pengaturan pilihan kain.");
      setFabrics([emptyFabric()]);
      setOtherAddons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const searchProducts = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setSearchHits([]);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({
        limit: "15",
        offset: "0",
        q: trimmed,
        fields: "id,title",
      });
      const res = await fetch(`/admin/products?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        products?: { id: string; title: string }[];
      };
      setSearchHits(
        (data.products ?? []).map((p) => ({
          id: p.id,
          title: p.title ?? p.id,
        })),
      );
    } catch (err) {
      console.error(err);
      setSearchHits([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchRow === null) return;
    const t = window.setTimeout(() => {
      void searchProducts(searchQ);
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchQ, searchRow, searchProducts]);

  const duplicateIds = useMemo(() => {
    const ids = fabrics.map((e) => e.id.trim()).filter(Boolean);
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) dup.add(id);
      seen.add(id);
    }
    return dup;
  }, [fabrics]);

  const save = async () => {
    if (duplicateIds.size) {
      toast.error("Ada ID kain yang dobel. Setiap ID harus unik.");
      return;
    }
    for (const row of fabrics) {
      if (!row.id.trim() || !row.label.trim()) {
        toast.error("Setiap baris wajib punya ID dan nama tampilan.");
        return;
      }
    }
    setSaving(true);
    try {
      const fabricPayload = formToPayload(fabrics);
      const combined = [...otherAddons, ...fabricPayload];
      const res = await fetch("/admin/metro-addon-catalog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: combined }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Pilihan kain disimpan.");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => setFabrics((prev) => [...prev, emptyFabric()]);
  const removeRow = (i: number) =>
    setFabrics((prev) => prev.filter((_, idx) => idx !== i));

  const patchRow = (i: number, patch: Partial<FabricForm>) => {
    setFabrics((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );
  };

  const addProductToRow = (rowIndex: number, p: LinkedProduct) => {
    setFabrics((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        if (row.linked_products.some((x) => x.id === p.id)) return row;
        return {
          ...row,
          linked_products: [...row.linked_products, p],
        };
      }),
    );
    setSearchHits([]);
    setSearchQ("");
  };

  const removeProductFromRow = (rowIndex: number, productId: string) => {
    setFabrics((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex
          ? {
              ...row,
              linked_products: row.linked_products.filter(
                (x) => x.id !== productId,
              ),
            }
          : row,
      ),
    );
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-2 px-6 py-4">
        <Heading level="h1">Pilihan Kain (Metro)</Heading>
        <Text size="small" className="text-ui-fg-subtle max-w-3xl">
          Atur jenis-jenis kain yang tersedia untuk konfigurator produk. Pilihan
          kain akan tampil sebagai opsi radio (hanya bisa pilih satu) di halaman
          produk storefront. Contoh: Emboss, Jacquard, Microcool, dll.
        </Text>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {loading ? (
          <Text>Memuat…</Text>
        ) : (
          <>
            {fabrics.map((row, i) => (
              <div
                key={i}
                className="rounded-lg border border-ui-border-base p-4 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Text weight="plus" size="small">
                    Kain #{i + 1}
                  </Text>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => removeRow(i)}
                    disabled={fabrics.length <= 1}
                  >
                    Hapus
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`id-${i}`}>
                      ID (unik, tidak diubah setelah dipakai)
                    </Label>
                    <Input
                      id={`id-${i}`}
                      value={row.id}
                      onChange={(e) => patchRow(i, { id: e.target.value })}
                      placeholder="mis. emboss, jacquard, microcool"
                    />
                    {duplicateIds.has(row.id.trim()) ? (
                      <Text size="small" className="text-ui-fg-error">
                        ID bentrok dengan baris lain.
                      </Text>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`label-${i}`}>Nama tampilan</Label>
                    <Input
                      id={`label-${i}`}
                      value={row.label}
                      onChange={(e) => patchRow(i, { label: e.target.value })}
                      placeholder="mis. Kain Emboss, Kain Jacquard"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`price-${i}`}>Harga tambahan (IDR)</Label>
                    <Input
                      id={`price-${i}`}
                      value={row.price}
                      onChange={(e) => patchRow(i, { price: e.target.value })}
                      placeholder="10000"
                    />
                    <Text size="xsmall" className="text-ui-fg-muted">
                      Harga ini akan ditambahkan ke harga dasar produk jika
                      pelanggan memilih kain ini.
                    </Text>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`scope-${i}`}>Berlaku untuk produk</Label>
                    <Select
                      value={row.scope}
                      onValueChange={(v) =>
                        patchRow(i, {
                          scope: v as ScopeMode,
                          linked_products:
                            v === "all" ? [] : row.linked_products,
                        })
                      }
                    >
                      <Select.Trigger id={`scope-${i}`} className="w-full">
                        <Select.Value placeholder="Pilih cakupan produk" />
                      </Select.Trigger>
                      <Select.Content>
                        {PRODUCT_SCOPE_OPTIONS.map((opt) => (
                          <Select.Item key={opt.value} value={opt.value}>
                            {opt.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`desc-${i}`}>
                    Deskripsi (opsional)
                  </Label>
                  <Textarea
                    id={`desc-${i}`}
                    value={row.description}
                    onChange={(e) =>
                      patchRow(i, { description: e.target.value })
                    }
                    rows={2}
                    placeholder="mis. Tekstur timbul elegan, cocok untuk jersey premium"
                  />
                </div>

                {row.scope !== "all" ? (
                  <div className="space-y-2 rounded-md bg-ui-bg-subtle p-3">
                    <Text size="small" weight="plus">
                      Produk untuk filter ini
                    </Text>
                    <div className="flex flex-wrap gap-2">
                      {row.linked_products.map((p) => (
                        <Badge key={p.id} size="small" className="gap-1">
                          <span>{p.title}</span>
                          <button
                            type="button"
                            className="text-ui-fg-muted hover:text-ui-fg-base"
                            aria-label={`Hapus ${p.title}`}
                            onClick={() => removeProductFromRow(i, p.id)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <Label>Cari produk (judul)</Label>
                        <Input
                          value={searchRow === i ? searchQ : ""}
                          onFocus={() => {
                            setSearchRow(i);
                            setSearchQ("");
                            setSearchHits([]);
                          }}
                          onChange={(e) => {
                            setSearchRow(i);
                            setSearchQ(e.target.value);
                          }}
                          placeholder="Ketik minimal 2 huruf…"
                        />
                      </div>
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        isLoading={searching && searchRow === i}
                        onClick={() => void searchProducts(searchQ)}
                      >
                        Cari
                      </Button>
                    </div>
                    {searchRow === i && searchHits.length ? (
                      <div className="flex flex-col gap-1 border border-ui-border-base rounded-md p-2 max-h-48 overflow-y-auto">
                        {searchHits.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="text-left text-sm px-2 py-1 rounded hover:bg-ui-bg-base"
                            onClick={() => addProductToRow(i, p)}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={addRow}>
                Tambah pilihan kain
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={saving}
                onClick={() => void save()}
              >
                Simpan
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Pilihan Kain",
  icon: Swatch,
});

export default MetroFabricsSettingsPage;
