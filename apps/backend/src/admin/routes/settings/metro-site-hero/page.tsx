import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Image } from "@medusajs/icons";
import { Button, Container, Heading, Input, Label, Text, Textarea, toast } from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

import {
  MetroSiteGalleryForm,
} from "../../../components/metro-site-gallery-form";

interface HeroFormData {
  urls: string[];
  tagline: string;
  heading: string;
  headingAccent: string;
  description: string;
}

const MetroSiteHeroPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<HeroFormData>({
    urls: [],
    tagline: "",
    heading: "",
    headingAccent: "",
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-hero", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        urls: string[];
        tagline?: string;
        heading?: string;
        headingAccent?: string;
        description?: string;
      };
      setForm({
        urls: [...(data.urls ?? [])],
        tagline: data.tagline ?? "",
        heading: data.heading ?? "",
        headingAccent: data.headingAccent ?? "",
        description: data.description ?? "",
      });
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data hero.");
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
      const res = await fetch("/admin/metro-site-hero", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as HeroFormData & { ok: boolean };
      setForm({
        urls: [...(data.urls ?? [])],
        tagline: data.tagline ?? "",
        heading: data.heading ?? "",
        headingAccent: data.headingAccent ?? "",
        description: data.description ?? "",
      });
      toast.success("Hero beranda disimpan.");
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
          Atur gambar latar, teks tagline, judul, dan deskripsi yang tampil di hero section
          halaman utama. Gambar bergilir otomatis jika lebih dari satu.
        </Text>
      </div>

      {/* --- Teks hero --- */}
      <div className="px-6 py-6 space-y-4 max-w-3xl">
        <Heading level="h2">Konten Teks</Heading>
        <Text size="small" className="text-ui-fg-muted">
          Teks ini muncul di atas gambar latar pada hero section storefront.
        </Text>
        <div>
          <Label>Tagline (teks kecil di atas judul)</Label>
          <Input
            value={form.tagline}
            placeholder="Jersey tim · Sekolah · Komunitas · Event"
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>
        <div>
          <Label>Judul — baris pertama (warna putih)</Label>
          <Input
            value={form.heading}
            placeholder="PEDE DI LAPANGAN"
            onChange={(e) => setForm({ ...form, heading: e.target.value })}
          />
        </div>
        <div>
          <Label>Judul — baris kedua (warna brand / aksen)</Label>
          <Input
            value={form.headingAccent}
            placeholder="MULAI DARI JERSEY-NYA"
            onChange={(e) => setForm({ ...form, headingAccent: e.target.value })}
          />
        </div>
        <div>
          <Label>Deskripsi (paragraf di bawah judul)</Label>
          <Textarea
            rows={3}
            value={form.description}
            placeholder="Mau jersey buat futsal sekolah, turnamen bareng komunitas, atau acara kampus? …"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </div>

      {/* --- Gambar hero --- */}
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" weight="plus" className="text-ui-fg-subtle">
          Gambar — pratinjau & urutan
        </Text>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setForm({ ...form, urls: [] });
              toast.info("Daftar gambar dikosongkan — klik Simpan untuk menerapkan di toko.");
            }}
          >
            Kosongkan gambar
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
          urls={form.urls}
          onUrlsChange={(urls) => setForm({ ...form, urls })}
          minUrls={0}
          maxUrls={8}
          uploadSuccessToastHint="Klik Simpan di bawah agar tersimpan."
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
