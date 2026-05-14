import { z } from "zod";

/**
 * Metadata toko — konten landing & kontak.
 * Legacy: satu blob `metro_site_content_json`.
 * Baru: per-bagian (`metro_site_*_json`) agar Admin bisa simpan per menu.
 */
export const METRO_SITE_CONTENT_METADATA_KEY = "metro_site_content_json";

export const METRO_SITE_COMPANY_METADATA_KEY = "metro_site_company_json";
export const METRO_SITE_GALLERY_METADATA_KEY = "metro_site_gallery_json";
export const METRO_SITE_CLIENTS_METADATA_KEY = "metro_site_clients_json";
export const METRO_SITE_TESTIMONIALS_METADATA_KEY = "metro_site_testimonials_json";
export const METRO_SITE_FAQ_METADATA_KEY = "metro_site_faq_json";
export const METRO_SITE_HERO_METADATA_KEY = "metro_site_hero_json";

export const metroSiteCompanySchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().min(1).max(500),
  address: z.string().min(1).max(1000),
  email: z.string().email().max(200),
  phoneDisplay: z.string().min(1).max(80),
  /** Angka untuk wa.me (tanpa +), mis. 6281234567890 */
  whatsappDigits: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9]+$/),
  social: z
    .object({
      instagram: z.string().max(500),
      tiktok: z.string().max(500),
      facebook: z.string().max(500).optional(),
      youtube: z.string().max(500).optional(),
    })
    .transform((s) => ({
      instagram: s.instagram,
      tiktok: s.tiktok,
      facebook: s.facebook ?? "",
      youtube: s.youtube ?? "",
    })),
});

const clientSchema = z.object({
  name: z.string().min(1).max(200),
  abbr: z.string().min(1).max(12),
});

const testimonialSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  initials: z.string().min(1).max(8),
});

const faqSchema = z.object({
  q: z.string().min(1).max(500),
  a: z.string().min(1).max(4000),
});

const galleryUrlsSchema = z
  .array(z.string().min(1).max(2000))
  .min(1)
  .max(40);

const gallerySplitWrapperSchema = z.object({
  v: z.literal(1),
  urls: galleryUrlsSchema,
});

const heroUrlsSchema = z
  .array(z.string().min(1).max(2000))
  .min(0)
  .max(8);

const heroSplitWrapperSchema = z.object({
  v: z.literal(1),
  urls: heroUrlsSchema,
});

export const metroSiteContentV1Schema = z.object({
  v: z.literal(1),
  company: metroSiteCompanySchema,
  gallery: galleryUrlsSchema,
  clients: z.array(clientSchema).min(1).max(60),
  testimonials: z.array(testimonialSchema).min(1).max(30),
  faq: z.array(faqSchema).min(1).max(50),
});

/** Isi legacy `metro_site_content_json` (tanpa hero — hero pakai kunci terpisah). */
export type MetroSiteContentBaseV1 = z.infer<typeof metroSiteContentV1Schema>;

/** Konten storefront lengkap termasuk URL latar hero (metadata `metro_site_hero_json`). */
export type MetroSiteContentV1 = MetroSiteContentBaseV1 & {
  heroBackgroundUrls: string[];
};
export type MetroSiteCompanyV1 = z.infer<typeof metroSiteCompanySchema>;

export const metroSiteGalleryPostSchema = z.object({
  urls: galleryUrlsSchema,
});

export const metroSiteHeroPostSchema = z.object({
  urls: heroUrlsSchema,
});

export const metroSiteClientsPostSchema = z.object({
  clients: z.array(clientSchema).min(1).max(60),
});

export const metroSiteTestimonialsPostSchema = z.object({
  testimonials: z.array(testimonialSchema).min(1).max(30),
});

export const metroSiteFaqPostSchema = z.object({
  faq: z.array(faqSchema).min(1).max(50),
});

function parseJsonValue(raw: unknown): unknown | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function parseMetroSiteContentFromMetadata(
  raw: unknown,
): MetroSiteContentV1 | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const r = metroSiteContentV1Schema.safeParse(parsed);
    return r.success ? { ...r.data, heroBackgroundUrls: [] } : null;
  } catch {
    return null;
  }
}

export function parseCompanyFromStoreMetadata(
  raw: unknown,
): MetroSiteCompanyV1 | null {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return null;
  const r = metroSiteCompanySchema.safeParse(parsed);
  return r.success ? r.data : null;
}

export function parseGalleryUrlsFromStoreMetadata(raw: unknown): string[] | null {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return null;
  if (Array.isArray(parsed)) {
    const r = galleryUrlsSchema.safeParse(parsed);
    return r.success ? r.data : null;
  }
  const w = gallerySplitWrapperSchema.safeParse(parsed);
  return w.success ? w.data.urls : null;
}

export function parseHeroUrlsFromStoreMetadata(raw: unknown): string[] | null {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return null;
  if (Array.isArray(parsed)) {
    const r = heroUrlsSchema.safeParse(parsed);
    return r.success ? r.data : null;
  }
  const w = heroSplitWrapperSchema.safeParse(parsed);
  return w.success ? w.data.urls : null;
}

export function parseClientsFromStoreMetadata(
  raw: unknown,
): MetroSiteContentV1["clients"] | null {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return null;
  const r = z.array(clientSchema).min(1).max(60).safeParse(parsed);
  return r.success ? r.data : null;
}

export function parseTestimonialsFromStoreMetadata(
  raw: unknown,
): MetroSiteContentV1["testimonials"] | null {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return null;
  const r = z.array(testimonialSchema).min(1).max(30).safeParse(parsed);
  return r.success ? r.data : null;
}

export function parseFaqFromStoreMetadata(
  raw: unknown,
): MetroSiteContentV1["faq"] | null {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return null;
  const r = z.array(faqSchema).min(1).max(50).safeParse(parsed);
  return r.success ? r.data : null;
}

/** Nilai awal — selaras dengan `apps/storefront/lib/data/site.ts` sebelum override admin. */
export function defaultMetroSiteContent(): MetroSiteContentV1 {
  return {
    v: 1,
    company: {
      name: "Metro Apparel",
      tagline: "Custom jersey & apparel produksi lokal, kualitas premium.",
      address:
        "Jl. Raya Mojowarno, Bedok, Bulurejo, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471",
      email: "metro.apparel24@gmail.com",
      phoneDisplay: "+62 812-3456-7890",
      whatsappDigits: "6281332079137",
      social: {
        instagram: "https://www.instagram.com/metro_apprl",
        tiktok: "",
        facebook: "",
        youtube: "",
      },
    },
    gallery: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=600&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
      "https://images.unsplash.com/photo-1461896836934-1a4bb36b5a32?w=600&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    ],
    clients: [
      { name: "Nebula FC", abbr: "NF" },
      { name: "Arcadia Esports", abbr: "AE" },
      { name: "SMK Teknika", abbr: "ST" },
      { name: "Kampus Merdeka Run", abbr: "KM" },
      { name: "Jakarta Futsal League", abbr: "JFL" },
      { name: "Hive Community", abbr: "HC" },
    ],
    testimonials: [
      {
        name: "Raka Pratama",
        role: "Manager — Nebula FC",
        message:
          "Jersey tim kami keluar tajam di lapangan. Komunikasi desain cepat, bahan enak dipakai latihan intens.",
        initials: "RP",
      },
      {
        name: "Dina Lestari",
        role: "PIC Event — Kampus Merdeka Run",
        message:
          "Butuh ratusan jersey dalam dua minggu — tetap rapi finishingnya. Sponsor placement juga rapi.",
        initials: "DL",
      },
      {
        name: "Fajar Hidayat",
        role: "Captain — Arcadia Esports",
        message:
          "Vibe esports-nya dapet: kontras warna, glow halus di mockup, dan fitting yang pede di panggung.",
        initials: "FH",
      },
    ],
    faq: [
      {
        q: "Berapa minimum order?",
        a: "MOQ fleksibel mulai 10 pcs untuk jersey tim. Untuk kebutuhan institusi besar, kami sesuaikan skema qty dan harga.",
      },
      {
        q: "Berapa lama waktu produksi?",
        a: "Rata-rata 7–14 hari kerja setelah desain final disetujui. Timeline bisa dipercepat untuk event dengan slot terbatas.",
      },
      {
        q: "Apakah desain bisa full custom?",
        a: "Ya. Kami bantu dari konsep, palet warna, typography, hingga mockup. Revisi desain dikonsultasikan per paket.",
      },
      {
        q: "Area pengiriman?",
        a: "Kota Jombang dan sekitarnya. Tersedia juga opsi pickup di workshop kami di Jombang.",
      },
    ],
    heroBackgroundUrls: [],
  };
}

function normalizedMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  return metadata;
}

/**
 * Gabungkan metadata toko: kunci per-bagian menang atas legacy per field
 * (legacy dipakai jika kunci bagian itu belum ada).
 */
export function resolveMetroSiteContent(
  metadata: Record<string, unknown> | null | undefined,
): MetroSiteContentV1 {
  const m = normalizedMetadata(metadata);
  const def = defaultMetroSiteContent();
  const legacy = parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]);

  const company =
    parseCompanyFromStoreMetadata(m[METRO_SITE_COMPANY_METADATA_KEY]) ??
    legacy?.company ??
    def.company;

  const gallery =
    parseGalleryUrlsFromStoreMetadata(m[METRO_SITE_GALLERY_METADATA_KEY]) ??
    legacy?.gallery ??
    def.gallery;

  const clients =
    parseClientsFromStoreMetadata(m[METRO_SITE_CLIENTS_METADATA_KEY]) ??
    legacy?.clients ??
    def.clients;

  const testimonials =
    parseTestimonialsFromStoreMetadata(m[METRO_SITE_TESTIMONIALS_METADATA_KEY]) ??
    legacy?.testimonials ??
    def.testimonials;

  const faq =
    parseFaqFromStoreMetadata(m[METRO_SITE_FAQ_METADATA_KEY]) ??
    legacy?.faq ??
    def.faq;

  const heroBackgroundUrls =
    parseHeroUrlsFromStoreMetadata(m[METRO_SITE_HERO_METADATA_KEY]) ??
    def.heroBackgroundUrls;

  return { v: 1, company, gallery, clients, testimonials, faq, heroBackgroundUrls };
}

/** @deprecated Prefer `resolveMetroSiteContent` dengan metadata penuh. */
export function mergeMetroSiteContent(rawLegacyBlob: unknown): MetroSiteContentV1 {
  return resolveMetroSiteContent({
    [METRO_SITE_CONTENT_METADATA_KEY]: rawLegacyBlob,
  });
}

export function serializeMetroSiteContent(content: MetroSiteContentV1): string {
  const { heroBackgroundUrls: _hero, ...rest } = content;
  return JSON.stringify(rest);
}

export function serializeMetroSiteCompany(company: MetroSiteCompanyV1): string {
  return JSON.stringify(company);
}

export function serializeMetroSiteGallery(urls: string[]): string {
  return JSON.stringify({ v: 1 as const, urls });
}

export function serializeMetroSiteHero(urls: string[]): string {
  return JSON.stringify({ v: 1 as const, urls });
}

export function serializeMetroSiteClients(
  clients: MetroSiteContentV1["clients"],
): string {
  return JSON.stringify(clients);
}

export function serializeMetroSiteTestimonials(
  testimonials: MetroSiteContentV1["testimonials"],
): string {
  return JSON.stringify(testimonials);
}

export function serializeMetroSiteFaq(faq: MetroSiteContentV1["faq"]): string {
  return JSON.stringify(faq);
}

export function hasAnySiteContentMetadata(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  if (m[METRO_SITE_CONTENT_METADATA_KEY] != null) return true;
  if (m[METRO_SITE_COMPANY_METADATA_KEY] != null) return true;
  if (m[METRO_SITE_GALLERY_METADATA_KEY] != null) return true;
  if (m[METRO_SITE_CLIENTS_METADATA_KEY] != null) return true;
  if (m[METRO_SITE_TESTIMONIALS_METADATA_KEY] != null) return true;
  if (m[METRO_SITE_FAQ_METADATA_KEY] != null) return true;
  if (m[METRO_SITE_HERO_METADATA_KEY] != null) return true;
  return false;
}

/** Legacy: hanya blob tunggal. */
export function hasSavedMetroSiteContent(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) != null;
}

export function isMetroSiteCompanySectionDefault(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return (
    parseCompanyFromStoreMetadata(m[METRO_SITE_COMPANY_METADATA_KEY]) == null &&
    parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) == null
  );
}

export function isMetroSiteGallerySectionDefault(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return (
    parseGalleryUrlsFromStoreMetadata(m[METRO_SITE_GALLERY_METADATA_KEY]) == null &&
    parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) == null
  );
}

export function isMetroSiteClientsSectionDefault(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return (
    parseClientsFromStoreMetadata(m[METRO_SITE_CLIENTS_METADATA_KEY]) == null &&
    parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) == null
  );
}

export function isMetroSiteTestimonialsSectionDefault(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return (
    parseTestimonialsFromStoreMetadata(m[METRO_SITE_TESTIMONIALS_METADATA_KEY]) ==
      null &&
    parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) == null
  );
}

export function isMetroSiteFaqSectionDefault(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return (
    parseFaqFromStoreMetadata(m[METRO_SITE_FAQ_METADATA_KEY]) == null &&
    parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) == null
  );
}

export function isMetroSiteHeroSectionDefault(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const m = normalizedMetadata(metadata);
  return (
    parseHeroUrlsFromStoreMetadata(m[METRO_SITE_HERO_METADATA_KEY]) == null &&
    parseMetroSiteContentFromMetadata(m[METRO_SITE_CONTENT_METADATA_KEY]) == null
  );
}

export function splitSiteContentDefaultsForSeed(): Record<string, string> {
  const d = defaultMetroSiteContent();
  return {
    [METRO_SITE_COMPANY_METADATA_KEY]: serializeMetroSiteCompany(d.company),
    [METRO_SITE_GALLERY_METADATA_KEY]: serializeMetroSiteGallery(d.gallery),
    [METRO_SITE_HERO_METADATA_KEY]: serializeMetroSiteHero(d.heroBackgroundUrls),
    [METRO_SITE_CLIENTS_METADATA_KEY]: serializeMetroSiteClients(d.clients),
    [METRO_SITE_TESTIMONIALS_METADATA_KEY]: serializeMetroSiteTestimonials(
      d.testimonials,
    ),
    [METRO_SITE_FAQ_METADATA_KEY]: serializeMetroSiteFaq(d.faq),
  };
}
