import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Tag } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

type ScopeMode = "all" | "only" | "except";

type LinkedProduct = { id: string; title: string };

type EntryForm = {
  id: string;
  label: string;
  surcharge: string;
  scope: ScopeMode;
  linked_products: LinkedProduct[];
};

type ApiEntry = {
  id: string;
  label: string;
  surcharge: number;
  scope: ScopeMode;
  product_ids: string[];
};

const emptyEntry = (): EntryForm => ({
  id: "",
  label: "",
  surcharge: "0",
  scope: "all",
  linked_products: [],
});

function apiEntryToForm(e: ApiEntry): EntryForm {
  return {
    id: e.id,
    label: e.label,
    surcharge: String(e.surcharge),
    scope: e.scope,
    linked_products: (e.product_ids ?? []).map((id) => ({
      id,
      title: id.length > 14 ? `${id.slice(0, 10)}…` : id,
    })),
  };
}

function formToPayload(entries: EntryForm[]) {
  return entries.map((row) => {
    const surcharge = Number.parseInt(row.surcharge.replace(/\s/g, ""), 10);
    return {
      id: row.id.trim(),
      label: row.label.trim(),
      surcharge: Number.isFinite(surcharge) ? surcharge : 0,
      scope: row.scope,
      product_ids: row.linked_products.map((p) => p.id),
    };
  });
}

const MetroCollarsSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<EntryForm[]>([]);
  const [searchRow, setSearchRow] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-collar-catalog", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { entries: ApiEntry[] };
      setEntries(
        data.entries?.length
          ? data.entries.map(apiEntryToForm)
          : [emptyEntry()],
      );
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat pengaturan kerah.");
      setEntries([emptyEntry()]);
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
    const ids = entries.map((e) => e.id.trim()).filter(Boolean);
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) dup.add(id);
      seen.add(id);
    }
    return dup;
  }, [entries]);

  const save = async () => {
    if (duplicateIds.size) {
      toast.error("Ada ID kerah yang dobel. Setiap ID harus unik.");
      return;
    }
    for (const row of entries) {
      if (!row.id.trim() || !row.label.trim()) {
        toast.error("Setiap baris wajib punya ID dan nama tampilan.");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/admin/metro-collar-catalog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: formToPayload(entries) }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Tipe kerah disimpan.");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => setEntries((prev) => [...prev, emptyEntry()]);
  const removeRow = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const patchRow = (i: number, patch: Partial<EntryForm>) => {
    setEntries((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );
  };

  const addProductToRow = (rowIndex: number, p: LinkedProduct) => {
    setEntries((prev) =>
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
    setEntries((prev) =>
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
        <Heading level="h1">Tipe kerah (Metro)</Heading>
        <Text size="small" className="text-ui-fg-subtle max-w-3xl">
          Atur opsi kerah untuk jersey atasan &amp; set. Tambahan harga (surcharge)
          dalam Rupiah. Secara default berlaku untuk semua produk; batasi per
          produk lewat filter di bawah.
        </Text>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {loading ? (
          <Text>Memuat…</Text>
        ) : (
          <>
            {entries.map((row, i) => (
              <div
                key={i}
                className="rounded-lg border border-ui-border-base p-4 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Text weight="plus" size="small">
                    Kerah #{i + 1}
                  </Text>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => removeRow(i)}
                    disabled={entries.length <= 1}
                  >
                    Hapus baris
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`cid-${i}`}>ID (unik)</Label>
                    <Input
                      id={`cid-${i}`}
                      value={row.id}
                      onChange={(e) => patchRow(i, { id: e.target.value })}
                      placeholder="mis. v-neck-2"
                    />
                    {duplicateIds.has(row.id.trim()) ? (
                      <Text size="small" className="text-ui-fg-error">
                        ID bentrok dengan baris lain.
                      </Text>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`clabel-${i}`}>Nama tampilan</Label>
                    <Input
                      id={`clabel-${i}`}
                      value={row.label}
                      onChange={(e) => patchRow(i, { label: e.target.value })}
                      placeholder="mis. V-neck 2.0"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`csurcharge-${i}`}>Tambahan harga (IDR)</Label>
                    <Input
                      id={`csurcharge-${i}`}
                      value={row.surcharge}
                      onChange={(e) => patchRow(i, { surcharge: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`cscope-${i}`}>Berlaku untuk produk</Label>
                    <select
                      id={`cscope-${i}`}
                      className="bg-ui-bg-field border-ui-border-base text-ui-fg-base rounded-md border px-3 py-2 text-sm"
                      value={row.scope}
                      onChange={(e) =>
                        patchRow(i, {
                          scope: e.target.value as ScopeMode,
                          linked_products:
                            e.target.value === "all" ? [] : row.linked_products,
                        })
                      }
                    >
                      <option value="all">Semua produk (default)</option>
                      <option value="only">Hanya produk terpilih</option>
                      <option value="except">Semua kecuali produk terpilih</option>
                    </select>
                  </div>
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
                Tambah tipe kerah
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
  label: "Metro collars",
  icon: Tag,
});

export default MetroCollarsSettingsPage;
