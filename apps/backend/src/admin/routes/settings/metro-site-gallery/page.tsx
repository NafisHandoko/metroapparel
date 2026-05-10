import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo } from "@medusajs/icons";
import { Button, Container, Heading, Text, toast } from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

import {
  defaultGalleryUrls,
  MetroSiteGalleryForm,
} from "../../../components/metro-site-gallery-form";
import { defaultMetroSiteContent } from "../../../../metro/metro-site-content";

const MetroSiteGalleryPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-gallery", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { urls: string[] };
      setUrls([...data.urls]);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat galeri.");
      setUrls(defaultGalleryUrls());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const toSend =
      urls.length > 0 ? urls : defaultMetroSiteContent().gallery;
    setSaving(true);
    try {
      const res = await fetch("/admin/metro-site-gallery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: toSend }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { urls: string[] };
      setUrls([...data.urls]);
      toast.success("Galeri disimpan.");
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
        <Heading level="h1">Galeri</Heading>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setUrls(defaultGalleryUrls());
              toast.info("Urutan & daftar gambar dikembalikan ke template default (simpan untuk menulis ke server).");
            }}
          >
            Reset ke default
          </Button>
          <Button type="button" isLoading={saving} onClick={() => void save()}>
            Simpan
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-5xl">
        {loading ? (
          <Text size="small" className="text-ui-fg-muted">
            Memuat dari server…
          </Text>
        ) : null}
        <Heading level="h2" className="sr-only">
          Pratinjau galeri
        </Heading>
        <MetroSiteGalleryForm urls={urls} onUrlsChange={setUrls} />
        <Button type="button" isLoading={saving} onClick={() => void save()}>
          Simpan
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Galeri",
  icon: Photo,
});

export default MetroSiteGalleryPage;
