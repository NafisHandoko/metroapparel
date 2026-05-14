import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Users } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

import type { MetroSiteContentV1 } from "../../../../metro/metro-site-content";
import { defaultMetroSiteContent } from "../../../../metro/metro-site-content";

type ClientRow = MetroSiteContentV1["clients"][number];

const MetroSiteClientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-clients", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { clients: ClientRow[] };
      setClients(data.clients);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat daftar klien.");
      setClients(defaultMetroSiteContent().clients);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/admin/metro-site-clients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { clients: ClientRow[] };
      setClients(data.clients);
      toast.success("Klien disimpan.");
    } catch (e) {
      console.error(e);
      toast.error(
        typeof e === "object" && e !== null && "message" in e
          ? String((e as Error).message)
          : "Gagal menyimpan.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Klien</Heading>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setClients(defaultMetroSiteContent().clients);
              toast.info("Daftar dikembalikan ke template default (simpan untuk menulis ke server).");
            }}
          >
            Reset ke default
          </Button>
          <Button type="button" isLoading={saving} onClick={() => void save()}>
            Simpan
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-4xl">
        {loading ? (
          <Text size="small" className="text-ui-fg-muted">
            Memuat dari server…
          </Text>
        ) : null}
        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-muted">
            Logo / nama klien di landing (inisial singkat untuk avatar).
          </Text>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => setClients([...clients, { name: "", abbr: "" }])}
          >
            Tambah baris
          </Button>
        </div>
        <div className="space-y-3">
          {clients.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <div>
                <Label>Nama</Label>
                <Input
                  value={row.name}
                  onChange={(e) => {
                    const next = [...clients];
                    next[i] = { ...next[i], name: e.target.value };
                    setClients(next);
                  }}
                />
              </div>
              <div>
                <Label>Singkatan</Label>
                <Input
                  value={row.abbr}
                  onChange={(e) => {
                    const next = [...clients];
                    next[i] = { ...next[i], abbr: e.target.value };
                    setClients(next);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="transparent"
                size="small"
                onClick={() => setClients(clients.filter((_, j) => j !== i))}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" isLoading={saving} onClick={() => void save()}>
          Simpan
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Klien",
  icon: Users,
});

export default MetroSiteClientsPage;
