import { DotsSix, Trash } from "@medusajs/icons";
import { Button, Input, Label, Text, toast } from "@medusajs/ui";
import {
  memo,
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";

import { defaultMetroSiteContent } from "../../metro/metro-site-content";

const MAX_GALLERY_UPLOAD_BYTES = 8 * 1024 * 1024;

const DEFAULT_HELP = (
  <>
    Atur urutan gambar seperti di etalase: <strong>Unggah</strong> ke server Medusa, atau
    <strong> tambah dari URL</strong> (mis. Unsplash). <strong>Tarik area gambar</strong> (ikon titik
    kiri atas) untuk mengurut ulang — urutan di sini sama dengan di storefront. Hapus dengan
    tombol sampah. Klik <strong>Simpan</strong> di atas / bawah halaman ini setelah selesai.
  </>
);

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
  /** Default 40 (galeri). Hero pakai 8. */
  maxUrls?: number;
  /** Default 1 — tidak boleh hapus sampai di bawah ambang ini. */
  minUrls?: number;
  /** Teks bantuan di atas form (default untuk galeri). */
  helpText?: ReactNode;
  /** Toast setelah upload batch (setelah jumlah file di-unggah). */
  uploadSuccessToastHint?: string;
};

// ─── Gallery Item (memoized) ──────────────────────────────────────────────

type GalleryItemProps = {
  url: string;
  index: number;
  onDragStart: (e: DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent, index: number) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent, index: number) => void;
  onRemove: (index: number) => void;
  isDragging: boolean;
};

const GalleryItem = memo(function GalleryItem({
  url,
  index,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  isDragging,
}: GalleryItemProps) {
  return (
    <li
      data-gallery-index={index}
      className="group relative overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle transition-shadow"
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
    >
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragEnd={onDragEnd}
        className={`relative aspect-[4/5] w-full cursor-grab touch-none bg-ui-bg-base active:cursor-grabbing ${
          isDragging ? "opacity-60" : ""
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
              onRemove(index);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
});

// ─── Main Form Component ──────────────────────────────────────────────────

export function MetroSiteGalleryForm({
  urls,
  onUrlsChange,
  maxUrls = 40,
  minUrls = 1,
  helpText = DEFAULT_HELP,
  uploadSuccessToastHint = "Klik Simpan bagian galeri agar tersimpan di toko.",
}: MetroSiteGalleryFormProps) {
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const galleryDragFromRef = useRef<number | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const [draggingGalleryIndex, setDraggingGalleryIndex] = useState<number | null>(
    null,
  );

  // ── Drag-over highlight via ref (no React re-render) ──────────────────
  const dragOverRef = useRef<number | null>(null);

  const clearDragOverHighlight = useCallback(() => {
    if (dragOverRef.current === null) return;
    const el = document.querySelector(
      `[data-gallery-index="${dragOverRef.current}"]`,
    );
    if (el) {
      el.classList.remove("border-ui-border-interactive", "ring-2", "ring-ui-border-interactive");
      el.classList.add("border-ui-border-base");
    }
    dragOverRef.current = null;
  }, []);

  const setDragOverHighlight = useCallback((index: number) => {
    if (dragOverRef.current === index) return;
    // Clear previous
    if (dragOverRef.current !== null) {
      const prev = document.querySelector(
        `[data-gallery-index="${dragOverRef.current}"]`,
      );
      if (prev) {
        prev.classList.remove("border-ui-border-interactive", "ring-2", "ring-ui-border-interactive");
        prev.classList.add("border-ui-border-base");
      }
    }
    // Set new
    const next = document.querySelector(`[data-gallery-index="${index}"]`);
    if (next) {
      next.classList.add("border-ui-border-interactive", "ring-2", "ring-ui-border-interactive");
      next.classList.remove("border-ui-border-base");
    }
    dragOverRef.current = index;
  }, []);

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

    const room = maxUrls - urls.length;
    if (room <= 0) {
      toast.error(`Maksimum ${maxUrls} gambar — hapus beberapa dulu.`);
      return;
    }

    setUploadingGallery(true);
    try {
      const fd = new FormData();
      const capped = files.slice(0, room);
      for (const f of capped) {
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
      toast.success(`${newUrls.length} gambar diunggah. ${uploadSuccessToastHint}`);
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

  const removeGalleryAt = useCallback(
    (index: number) => {
      if (urls.length <= minUrls) {
        toast.error(`Minimal ${minUrls} gambar.`);
        return;
      }
      onUrlsChange(urls.filter((_, i) => i !== index));
    },
    [urls, minUrls, onUrlsChange],
  );

  const addGalleryUrlFromDraft = () => {
    const raw = galleryUrlDraft.trim();
    if (!raw) return;
    if (!/^https?:\/\//i.test(raw)) {
      toast.error("URL harus diawali http:// atau https://");
      return;
    }
    if (urls.length >= maxUrls) {
      toast.error(`Maksimum ${maxUrls} gambar.`);
      return;
    }
    if (urls.includes(raw)) {
      setGalleryUrlDraft("");
      toast.info("URL ini sudah ada di galeri.");
      return;
    }
    onUrlsChange([...urls, raw]);
    setGalleryUrlDraft("");
    toast.success(`Gambar ditambahkan dari URL. ${uploadSuccessToastHint}`);
  };

  // ── Drag handlers (stable references via useCallback) ─────────────────

  const handleGalleryDragStart = useCallback((_e: DragEvent, index: number) => {
    galleryDragFromRef.current = index;
    setDraggingGalleryIndex(index);
    _e.dataTransfer.effectAllowed = "move";
    _e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleGalleryDragEnd = useCallback(() => {
    galleryDragFromRef.current = null;
    setDraggingGalleryIndex(null);
    clearDragOverHighlight();
  }, [clearDragOverHighlight]);

  const handleGalleryDragOver = useCallback(
    (e: DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const from = galleryDragFromRef.current;
      if (from !== null && from !== index) {
        setDragOverHighlight(index);
      }
    },
    [setDragOverHighlight],
  );

  const handleGalleryDragLeave = useCallback((e: DragEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    clearDragOverHighlight();
  }, [clearDragOverHighlight]);

  const handleGalleryDrop = useCallback(
    (e: DragEvent, toIndex: number) => {
      e.preventDefault();
      clearDragOverHighlight();
      const fromIndex = Number.parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
        galleryDragFromRef.current = null;
        setDraggingGalleryIndex(null);
        return;
      }
      onUrlsChange(reorderGalleryItems(urls, fromIndex, toIndex));
      galleryDragFromRef.current = null;
      setDraggingGalleryIndex(null);
    },
    [urls, onUrlsChange, clearDragOverHighlight],
  );

  return (
    <div className="space-y-4">
      <Text size="small" className="text-ui-fg-muted">
        {helpText}
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
            <GalleryItem
              key={url}
              url={url}
              index={index}
              onDragStart={handleGalleryDragStart}
              onDragEnd={handleGalleryDragEnd}
              onDragOver={handleGalleryDragOver}
              onDragLeave={handleGalleryDragLeave}
              onDrop={handleGalleryDrop}
              onRemove={removeGalleryAt}
              isDragging={draggingGalleryIndex === index}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export function defaultGalleryUrls(): string[] {
  return [...defaultMetroSiteContent().gallery];
}
