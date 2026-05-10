import { DotsSix, Trash } from "@medusajs/icons";
import { Button, Input, Label, Text, toast } from "@medusajs/ui";
import { useRef, useState } from "react";

import { defaultMetroSiteContent } from "../../metro/metro-site-content";

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

export type MetroSiteGalleryFormProps = {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
};

export function MetroSiteGalleryForm({ urls, onUrlsChange }: MetroSiteGalleryFormProps) {
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const galleryDragFromRef = useRef<number | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const [draggingGalleryIndex, setDraggingGalleryIndex] = useState<number | null>(
    null,
  );
  const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState<number | null>(
    null,
  );

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
      const newUrls = (data.files ?? []).map(uploadRowPublicUrl).filter(Boolean);
      if (!newUrls.length) {
        throw new Error("Upload berhasil tetapi tidak ada URL file di respons.");
      }
      onUrlsChange([...urls, ...newUrls]);
      toast.success(
        `${newUrls.length} gambar diunggah. Klik Simpan bagian galeri agar tersimpan di toko.`,
      );
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Gagal mengunggah gambar (periksa hak akses admin / modul file).",
      );
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  };

  const removeGalleryAt = (index: number) => {
    if (urls.length <= 1) {
      toast.error("Minimal satu gambar di galeri.");
      return;
    }
    onUrlsChange(urls.filter((_, i) => i !== index));
  };

  const addGalleryUrlFromDraft = () => {
    const raw = galleryUrlDraft.trim();
    if (!raw) return;
    if (!/^https?:\/\//i.test(raw)) {
      toast.error("URL harus diawali http:// atau https://");
      return;
    }
    if (urls.includes(raw)) {
      setGalleryUrlDraft("");
      toast.info("URL ini sudah ada di galeri.");
      return;
    }
    onUrlsChange([...urls, raw]);
    setGalleryUrlDraft("");
    toast.success("Gambar ditambahkan dari URL. Klik Simpan untuk menyimpan.");
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
    onUrlsChange(reorderGalleryItems(urls, fromIndex, toIndex));
    galleryDragFromRef.current = null;
    setDraggingGalleryIndex(null);
    setDragOverGalleryIndex(null);
  };

  return (
    <div className="space-y-4">
      <Text size="small" className="text-ui-fg-muted">
        Atur urutan gambar seperti di etalase: <strong>Unggah</strong> ke server Medusa, atau
        <strong> tambah dari URL</strong> (mis. Unsplash). <strong>Tarik area gambar</strong> (ikon titik
        kiri atas) untuk mengurut ulang — urutan di sini sama dengan di storefront. Hapus dengan
        tombol sampah. Klik <strong>Simpan</strong> di atas / bawah halaman ini setelah selesai.
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

      {urls.length === 0 ? (
        <Text size="small" className="text-ui-fg-muted">
          Belum ada gambar. Unggah atau tambah URL di atas.
        </Text>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {urls.map((url, index) => (
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
    </div>
  );
}

export function defaultGalleryUrls(): string[] {
  return [...defaultMetroSiteContent().gallery];
}
