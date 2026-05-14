import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Image } from "@medusajs/icons";
import { Button, Container, Heading, Text, toast } from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

import {
  MetroSiteGalleryForm,
} from "../../../components/metro-site-gallery-form";

const MetroSiteHeroPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-hero", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { urls: string[] };
      setUrls([...data.urls]);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat gambar hero.");
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const toSend = urls;
    setSaving(true);
    try {
      const res = await fetch("/admin/metro-site-hero", {
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
      toast.success("Gambar hero disimpan.");
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
      <div className="flex flex-col gap-2 px-6 py-4">
        <Heading level="h1">Hero beranda</Heading>
        <Text size="small" className="text-ui-fg-muted max-w-2xl">
          Gambar latar besar di atas halaman utama (bergilir otomatis jika ada lebih dari
          satu). Unggah ke server atau tambah URL — maksimal 8 gambar; boleh kosong (tanpa
          gambar = latar hitam di toko). Urutan = urutan tampil di storefront.
        </Text>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" weight="plus" className="text-ui-fg-subtle">
          Pratinjau & urutan
        </Text>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setUrls([]);
              toast.info("Daftar dikosongkan — klik Simpan untuk menerapkan di toko.");
            }}
          >
            Kosongkan semua
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
        <MetroSiteGalleryForm
          urls={urls}
          onUrlsChange={setUrls}
          minUrls={0}
          maxUrls={8}
          uploadSuccessToastHint="Klik Simpan di atas agar tersimpan di toko."
          helpText={
            <>
              <strong>Unggah</strong> ke server Medusa atau <strong>tambah dari URL</strong> gambar
              (mis. CDN / Unsplash). <strong>Tarik</strong> area gambar (ikon titik kiri atas) untuk
              mengurut ulang — urutan sama dengan pergantian slide di beranda. Kosongkan semua
              untuk latar hitam di toko. Hapus dengan tombol sampah. Klik <strong>Simpan</strong>{" "}
              setelah selesai.
            </>
          }
        />
        <Button type="button" isLoading={saving} onClick={() => void save()}>
          Simpan
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Hero beranda",
  icon: Image,
});

export default MetroSiteHeroPage;
