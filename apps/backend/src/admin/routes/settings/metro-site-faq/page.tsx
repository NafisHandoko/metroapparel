import { defineRouteConfig } from "@medusajs/admin-sdk";
import { QuestionMarkCircle } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

import type { MetroSiteContentV1 } from "../../../../metro/metro-site-content";
import { defaultMetroSiteContent } from "../../../../metro/metro-site-content";

type Row = MetroSiteContentV1["faq"][number];

const MetroSiteFaqPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faq, setFaq] = useState<Row[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-faq", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { faq: Row[] };
      setFaq(data.faq);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat FAQ.");
      setFaq(defaultMetroSiteContent().faq);
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
      const res = await fetch("/admin/metro-site-faq", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faq }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { faq: Row[] };
      setFaq(data.faq);
      toast.success("FAQ disimpan.");
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
        <Heading level="h1">FAQ</Heading>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFaq(defaultMetroSiteContent().faq);
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
            Pertanyaan yang sering diajukan di halaman landing.
          </Text>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => setFaq([...faq, { q: "", a: "" }])}
          >
            Tambah FAQ
          </Button>
        </div>
        <div className="space-y-6">
          {faq.map((row, i) => (
            <div key={i} className="space-y-2 border border-ui-border-base rounded-md p-4">
              <div>
                <Label>Pertanyaan</Label>
                <Input
                  value={row.q}
                  onChange={(e) => {
                    const next = [...faq];
                    next[i] = { ...next[i], q: e.target.value };
                    setFaq(next);
                  }}
                />
              </div>
              <div>
                <Label>Jawaban</Label>
                <Textarea
                  rows={4}
                  value={row.a}
                  onChange={(e) => {
                    const next = [...faq];
                    next[i] = { ...next[i], a: e.target.value };
                    setFaq(next);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="transparent"
                size="small"
                onClick={() => setFaq(faq.filter((_, j) => j !== i))}
              >
                Hapus FAQ
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
  label: "FAQ",
  icon: QuestionMarkCircle,
});

export default MetroSiteFaqPage;
