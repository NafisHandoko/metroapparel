import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
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

type Row = MetroSiteContentV1["testimonials"][number];

const MetroSiteTestimonialsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testimonials, setTestimonials] = useState<Row[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-testimonials", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { testimonials: Row[] };
      setTestimonials(data.testimonials);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat testimoni.");
      setTestimonials(defaultMetroSiteContent().testimonials);
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
      const res = await fetch("/admin/metro-site-testimonials", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { testimonials: Row[] };
      setTestimonials(data.testimonials);
      toast.success("Testimoni disimpan.");
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
        <Heading level="h1">Testimoni</Heading>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setTestimonials(defaultMetroSiteContent().testimonials);
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
            Kutipan pelanggan untuk blok testimoni di storefront.
          </Text>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() =>
              setTestimonials([
                ...testimonials,
                { name: "", role: "", message: "", initials: "" },
              ])
            }
          >
            Tambah testimoni
          </Button>
        </div>
        <div className="space-y-6 border border-ui-border-base rounded-md p-4">
          {testimonials.map((row, i) => (
            <div
              key={i}
              className="space-y-3 border-b border-ui-border-base pb-6 last:border-0 last:pb-0"
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label>Nama</Label>
                  <Input
                    value={row.name}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[i] = { ...next[i], name: e.target.value };
                      setTestimonials(next);
                    }}
                  />
                </div>
                <div>
                  <Label>Peran / tim</Label>
                  <Input
                    value={row.role}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[i] = { ...next[i], role: e.target.value };
                      setTestimonials(next);
                    }}
                  />
                </div>
                <div>
                  <Label>Inisial (avatar)</Label>
                  <Input
                    value={row.initials}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[i] = { ...next[i], initials: e.target.value };
                      setTestimonials(next);
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Pesan</Label>
                <Textarea
                  rows={3}
                  value={row.message}
                  onChange={(e) => {
                    const next = [...testimonials];
                    next[i] = { ...next[i], message: e.target.value };
                    setTestimonials(next);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="transparent"
                size="small"
                onClick={() =>
                  setTestimonials(testimonials.filter((_, j) => j !== i))
                }
              >
                Hapus testimoni
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
  label: "Testimoni",
  icon: ChatBubbleLeftRight,
});

export default MetroSiteTestimonialsPage;
