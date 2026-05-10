import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DotsSix, Photo, Trash } from "@medusajs/icons";
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
import { useCallback, useEffect, useRef, useState } from "react";

import type { MetroSiteContentV1 } from "../../../../metro/metro-site-content";
import { defaultMetroSiteContent } from "../../../../metro/metro-site-content";

const MAX_GALLERY_UPLOAD_BYTES = 8 * 1024 * 1024;

type UploadFileRow = {
  id?: string;
  url?: string | null;
  file?: { url?: string | null };
};

function uploadRowPublicUrl(row: UploadFileRow): string {
  const direct = typeof row.url === "string" ? row.url.trim() : "";
  if (direct) return direct;
  const nested = typeof row.file?.url === "string" ? row.file.url.trim() : "";
  return nested;
}

function reorderGalleryItems(
  urls: string[],
  fromIndex: number,
  toIndex: number,
): string[] {
  if (fromIndex === toIndex) return urls;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= urls.length ||
    toIndex >= urls.length
  ) {
    return urls;
  }
  const next = [...urls];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

const MetroSiteContentSettingsPage = () => {
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  /** Indeks sumber drag (HTML5 DnD) — ref agar `dragOver` tidak baca state stale. */
  const galleryDragFromRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [content, setContent] = useState<MetroSiteContentV1 | null>(null);
  /** Urutan gambar galeri (URL publik) — disinkronkan ke `content.gallery` saat simpan. */
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const [draggingGalleryIndex, setDraggingGalleryIndex] = useState<number | null>(
    null,
  );
  const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState<number | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-content", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { content: MetroSiteContentV1 };
      setContent(data.content);
      setGalleryUrls([...data.content.gallery]);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat konten toko.");
      const d = defaultMetroSiteContent();
      setContent(d);
      setGalleryUrls([...d.gallery]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadGalleryImages = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        toast.error(`Bukan gambar: ${f.name}`);
        return;
      }
      if (f.size > MAX_GALLERY_UPLOAD_BYTES) {
        toast.error(`File terlalu besar (maks. 8 MB): ${f.name}`);
        return;
      }
    }

    setUploadingGallery(true);
    try {
      const fd = new FormData();
      for (const f of files) {
        fd.append("files", f);
      }
      const res = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { files?: UploadFileRow[] };
      const urls = (data.files ?? []).map(uploadRowPublicUrl).filter(Boolean);
      if (!urls.length) {
        throw new Error("Upload berhasil tetapi tidak ada URL file di respons.");
      }
      setGalleryUrls((prev) => [...prev, ...urls]);
      toast.success(
        `${urls.length} gambar diunggah. Klik Simpan semua agar tersimpan di toko.`,
      );
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error ? e.message : "Gagal mengunggah gambar (periksa hak akses admin / modul file).",
      );
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  };

  const removeGalleryAt = (index: number) => {
    setGalleryUrls((prev) => {
      if (prev.length <= 1) {
        toast.error("Minimal satu gambar di galeri.");
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const addGalleryUrlFromDraft = () => {
    const raw = galleryUrlDraft.trim();
    if (!raw) return;
    if (!/^https?:\/\//i.test(raw)) {
      toast.error("URL harus diawali http:// atau https://");
      return;
    }
    let duplicate = false;
    setGalleryUrls((prev) => {
      if (prev.includes(raw)) {
        duplicate = true;
        return prev;
      }
      return [...prev, raw];
    });
    setGalleryUrlDraft("");
    if (duplicate) {
      toast.info("URL ini sudah ada di galeri.");
    } else {
      toast.success("Gambar ditambahkan dari URL. Klik Simpan semua untuk menyimpan.");
    }
  };

  const handleGalleryDragStart = (e: React.DragEvent, index: number) => {
    galleryDragFromRef.current = index;
    setDraggingGalleryIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleGalleryDragEnd = () => {
    galleryDragFromRef.current = null;
    setDraggingGalleryIndex(null);
    setDragOverGalleryIndex(null);
  };

  const handleGalleryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const from = galleryDragFromRef.current;
    if (from !== null && from !== index) {
      setDragOverGalleryIndex(index);
    }
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDragOverGalleryIndex(null);
  };

  const handleGalleryDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = Number.parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
      galleryDragFromRef.current = null;
      setDraggingGalleryIndex(null);
      setDragOverGalleryIndex(null);
      return;
    }
    setGalleryUrls((prev) => reorderGalleryItems(prev, fromIndex, toIndex));
    galleryDragFromRef.current = null;
    setDraggingGalleryIndex(null);
    setDragOverGalleryIndex(null);
  };

  const save = async () => {
    if (!content) return;
    const gallery =
      galleryUrls.length > 0 ? galleryUrls : defaultMetroSiteContent().gallery;
    const toSave: MetroSiteContentV1 = { ...content, gallery };
    setSaving(true);
    try {
      const res = await fetch("/admin/metro-site-content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { content: MetroSiteContentV1 };
      setContent(data.content);
      setGalleryUrls([...data.content.gallery]);
      toast.success("Konten toko disimpan.");
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

  if (!content) {
    return (
      <Container className="p-6">
        <Text>Memuat…</Text>
      </Container>
    );
  }

  const c = content;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Konten toko (storefront)</Heading>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const d = defaultMetroSiteContent();
              setContent(d);
              setGalleryUrls([...d.gallery]);
              setGalleryUrlDraft("");
              toast.info("Form dikembalikan ke template default (simpan untuk menulis ke server).");
            }}
          >
            Reset form ke default
          </Button>
          <Button type="button" isLoading={saving} onClick={() => void save()}>
            Simpan
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-10 max-w-4xl">
        {loading ? (
          <Text size="small" className="text-ui-fg-muted">
            Memuat dari server…
          </Text>
        ) : null}
        <section className="space-y-4">
          <Heading level="h2">Perusahaan & kontak</Heading>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nama toko</Label>
              <Input
                value={c.company.name}
                onChange={(e) =>
                  setContent({ ...c, company: { ...c.company, name: e.target.value } })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={c.company.email}
                onChange={(e) =>
                  setContent({ ...c, company: { ...c.company, email: e.target.value } })
                }
              />
            </div>
          </div>
          <div>
            <Label>Tagline</Label>
            <Input
              value={c.company.tagline}
              onChange={(e) =>
                setContent({ ...c, company: { ...c.company, tagline: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Alamat (multi baris OK)</Label>
            <Textarea
              rows={3}
              value={c.company.address}
              onChange={(e) =>
                setContent({ ...c, company: { ...c.company, address: e.target.value } })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Telepon (tampilan)</Label>
              <Input
                value={c.company.phoneDisplay}
                onChange={(e) =>
                  setContent({
                    ...c,
                    company: { ...c.company, phoneDisplay: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label>WhatsApp (angka saja, contoh 6281234567890)</Label>
              <Input
                value={c.company.whatsappDigits}
                onChange={(e) =>
                  setContent({
                    ...c,
                    company: {
                      ...c.company,
                      whatsappDigits: e.target.value.replace(/\D/g, ""),
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Instagram (URL)</Label>
              <Input
                value={c.company.social.instagram}
                onChange={(e) =>
                  setContent({
                    ...c,
                    company: {
                      ...c.company,
                      social: { ...c.company.social, instagram: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>TikTok (URL)</Label>
              <Input
                value={c.company.social.tiktok}
                onChange={(e) =>
                  setContent({
                    ...c,
                    company: {
                      ...c.company,
                      social: { ...c.company.social, tiktok: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Facebook (URL, opsional)</Label>
              <Input
                value={c.company.social.facebook ?? ""}
                onChange={(e) =>
                  setContent({
                    ...c,
                    company: {
                      ...c.company,
                      social: { ...c.company.social, facebook: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>YouTube (URL, opsional)</Label>
              <Input
                value={c.company.social.youtube ?? ""}
                onChange={(e) =>
                  setContent({
                    ...c,
                    company: {
                      ...c.company,
                      social: { ...c.company.social, youtube: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <Heading level="h2">Galeri</Heading>
          <Text size="small" className="text-ui-fg-muted">
            Atur urutan gambar seperti di etalase: <strong>Unggah</strong> ke server Medusa, atau
            <strong> tambah dari URL</strong> (mis. Unsplash). <strong>Tarik area gambar</strong> (ikon titik
            kiri atas) untuk mengurut ulang — urutan di sini sama dengan di storefront. Hapus dengan
            tombol sampah. Jangan lupa <strong>Simpan semua</strong> setelah selesai.
          </Text>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => void uploadGalleryImages(e.target.files)}
              />
              <Button
                type="button"
                variant="secondary"
                isLoading={uploadingGallery}
                onClick={() => galleryFileInputRef.current?.click()}
              >
                Unggah gambar…
              </Button>
              <Text size="small" className="text-ui-fg-muted">
                Maks. 8 MB per file
              </Text>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-xl">
              <Label>Tambah dari URL gambar</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="https://…"
                  value={galleryUrlDraft}
                  onChange={(e) => setGalleryUrlDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryUrlFromDraft();
                    }
                  }}
                  className="min-w-[12rem] flex-1"
                />
                <Button type="button" variant="secondary" onClick={addGalleryUrlFromDraft}>
                  Tambah URL
                </Button>
              </div>
            </div>
          </div>

          {galleryUrls.length === 0 ? (
            <Text size="small" className="text-ui-fg-muted">
              Belum ada gambar. Unggah atau tambah URL di atas.
            </Text>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {galleryUrls.map((url, index) => (
                <li
                  key={`${index}-${url.slice(0, 48)}`}
                  className={`group relative overflow-hidden rounded-lg border bg-ui-bg-subtle transition-shadow ${
                    dragOverGalleryIndex === index
                      ? "border-ui-border-interactive ring-2 ring-ui-border-interactive"
                      : "border-ui-border-base"
                  }`}
                  onDragOver={(e) => handleGalleryDragOver(e, index)}
                  onDragLeave={handleGalleryDragLeave}
                  onDrop={(e) => handleGalleryDrop(e, index)}
                >
                  <div
                    draggable
                    onDragStart={(e) => handleGalleryDragStart(e, index)}
                    onDragEnd={handleGalleryDragEnd}
                    className={`relative aspect-[4/5] w-full cursor-grab touch-none bg-ui-bg-base active:cursor-grabbing ${
                      draggingGalleryIndex === index ? "opacity-60" : ""
                    }`}
                  >
                    <div
                      className="pointer-events-none absolute left-1.5 top-1.5 z-[1] flex h-7 w-7 items-center justify-center rounded border border-white/25 bg-black/45 text-white/95 shadow-sm"
                      title="Seret untuk mengurut ulang"
                      aria-hidden
                    >
                      <DotsSix className="h-4 w-4" />
                    </div>
                    <img
                      src={url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-2 pb-2 pt-10">
                      <p
                        className="line-clamp-2 break-all text-[10px] leading-snug text-white/95"
                        title={url}
                      >
                        {url}
                      </p>
                    </div>
                    <div className="absolute right-1.5 top-1.5 z-[1]">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="h-8 w-8 border border-red-500/40 bg-ui-bg-base p-0 text-red-600 shadow-sm hover:bg-red-500/10"
                        title="Hapus gambar ini"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGalleryAt(index);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading level="h2">Klien</Heading>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                setContent({
                  ...c,
                  clients: [...c.clients, { name: "", abbr: "" }],
                })
              }
            >
              Tambah baris
            </Button>
          </div>
          <div className="space-y-3">
            {c.clients.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <div>
                  <Label>Nama</Label>
                  <Input
                    value={row.name}
                    onChange={(e) => {
                      const next = [...c.clients];
                      next[i] = { ...next[i], name: e.target.value };
                      setContent({ ...c, clients: next });
                    }}
                  />
                </div>
                <div>
                  <Label>Singkatan</Label>
                  <Input
                    value={row.abbr}
                    onChange={(e) => {
                      const next = [...c.clients];
                      next[i] = { ...next[i], abbr: e.target.value };
                      setContent({ ...c, clients: next });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="transparent"
                  size="small"
                  onClick={() =>
                    setContent({
                      ...c,
                      clients: c.clients.filter((_, j) => j !== i),
                    })
                  }
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading level="h2">Testimoni</Heading>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                setContent({
                  ...c,
                  testimonials: [
                    ...c.testimonials,
                    { name: "", role: "", message: "", initials: "" },
                  ],
                })
              }
            >
              Tambah testimoni
            </Button>
          </div>
          <div className="space-y-6 border border-ui-border-base rounded-md p-4">
            {c.testimonials.map((row, i) => (
              <div key={i} className="space-y-3 border-b border-ui-border-base pb-6 last:border-0 last:pb-0">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <Label>Nama</Label>
                    <Input
                      value={row.name}
                      onChange={(e) => {
                        const next = [...c.testimonials];
                        next[i] = { ...next[i], name: e.target.value };
                        setContent({ ...c, testimonials: next });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Peran / tim</Label>
                    <Input
                      value={row.role}
                      onChange={(e) => {
                        const next = [...c.testimonials];
                        next[i] = { ...next[i], role: e.target.value };
                        setContent({ ...c, testimonials: next });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Inisial (avatar)</Label>
                    <Input
                      value={row.initials}
                      onChange={(e) => {
                        const next = [...c.testimonials];
                        next[i] = { ...next[i], initials: e.target.value };
                        setContent({ ...c, testimonials: next });
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
                      const next = [...c.testimonials];
                      next[i] = { ...next[i], message: e.target.value };
                      setContent({ ...c, testimonials: next });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="transparent"
                  size="small"
                  onClick={() =>
                    setContent({
                      ...c,
                      testimonials: c.testimonials.filter((_, j) => j !== i),
                    })
                  }
                >
                  Hapus testimoni
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading level="h2">FAQ</Heading>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                setContent({
                  ...c,
                  faq: [...c.faq, { q: "", a: "" }],
                })
              }
            >
              Tambah FAQ
            </Button>
          </div>
          <div className="space-y-6">
            {c.faq.map((row, i) => (
              <div key={i} className="space-y-2 border border-ui-border-base rounded-md p-4">
                <div>
                  <Label>Pertanyaan</Label>
                  <Input
                    value={row.q}
                    onChange={(e) => {
                      const next = [...c.faq];
                      next[i] = { ...next[i], q: e.target.value };
                      setContent({ ...c, faq: next });
                    }}
                  />
                </div>
                <div>
                  <Label>Jawaban</Label>
                  <Textarea
                    rows={4}
                    value={row.a}
                    onChange={(e) => {
                      const next = [...c.faq];
                      next[i] = { ...next[i], a: e.target.value };
                      setContent({ ...c, faq: next });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="transparent"
                  size="small"
                  onClick={() =>
                    setContent({
                      ...c,
                      faq: c.faq.filter((_, j) => j !== i),
                    })
                  }
                >
                  Hapus FAQ
                </Button>
              </div>
            ))}
          </div>
        </section>

        <Button type="button" isLoading={saving} onClick={() => void save()}>
          Simpan semua
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Konten toko",
  icon: Photo,
});

export default MetroSiteContentSettingsPage;
