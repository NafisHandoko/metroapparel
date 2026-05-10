import { z } from "zod";

/** Metadata toko — konten landing & kontak (Admin → Settings → Konten toko). */
export const METRO_SITE_CONTENT_METADATA_KEY = "metro_site_content_json";

const companySchema = z.object({
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

export const metroSiteContentV1Schema = z.object({
  v: z.literal(1),
  company: companySchema,
  gallery: z.array(z.string().min(1).max(2000)).min(1).max(40),
  clients: z.array(clientSchema).min(1).max(60),
  testimonials: z.array(testimonialSchema).min(1).max(30),
  faq: z.array(faqSchema).min(1).max(50),
});

export type MetroSiteContentV1 = z.infer<typeof metroSiteContentV1Schema>;

/** Nilai awal — selaras dengan `apps/storefront/lib/data/site.ts` sebelum override admin. */
export function defaultMetroSiteContent(): MetroSiteContentV1 {
  return {
    v: 1,
    company: {
      name: "Metro Apparel",
      tagline: "Custom jersey & apparel produksi lokal, kualitas premium.",
      address:
        "Jl. Raya Mojowarno, Bedok, Bulurejo, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471",
      email: "halo@metroapparel.id",
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
        a: "Seluruh Indonesia via kurir. Untuk Jabodetabek tersedia opsi pickup di workshop kami.",
      },
    ],
  };
}

export function parseMetroSiteContentFromMetadata(
  raw: unknown,
): MetroSiteContentV1 | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const r = metroSiteContentV1Schema.safeParse(parsed);
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

export function mergeMetroSiteContent(
  raw: unknown,
): MetroSiteContentV1 {
  const parsed = parseMetroSiteContentFromMetadata(raw);
  return parsed ?? defaultMetroSiteContent();
}

export function serializeMetroSiteContent(content: MetroSiteContentV1): string {
  return JSON.stringify(content);
}

export function hasSavedMetroSiteContent(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  const raw = metadata?.[METRO_SITE_CONTENT_METADATA_KEY];
  return parseMetroSiteContentFromMetadata(raw) != null;
}
