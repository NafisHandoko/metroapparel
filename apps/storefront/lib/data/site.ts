/**
 * Fallback bila API Medusa tidak tersedia. Konten utama beranda & kontak diambil dari
 * Admin → Settings (Informasi perusahaan, Galeri, Klien, Testimoni, FAQ) — metadata
 * `metro_site_*_json` di store; fallback `metro_site_content_json` legacy.
 */
export const site = {
  name: "Metro Apparel",
  tagline: "Custom jersey & apparel produksi lokal, kualitas premium.",
  address: "Jl. Raya Mojowarno, Bedok, Bulurejo, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471",
  email: "metro.apparel24@gmail.com",
  phoneDisplay: "+62 812-3456-7890",
  social: {
    instagram: "https://www.instagram.com/metro_apprl",
    tiktok: "",
  },
};

export const stats = [
  { value: "5000+", label: "Jersey telah diproduksi" },
  { value: "300+", label: "Tim & komunitas mempercayai kami" },
  { value: "7-14", label: "Hari produksi rata-rata" },
];

/** Kategori Medusa / jalur katalog toko (bukan siluet per produk). */
export const categories = [
  {
    slug: "custom-jersey",
    name: "Custom Jersey",
    description:
      "Jersey atasan & set — paket Essential-Prime dan Regular-Ultimate.",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
  },
  {
    slug: "toko-metro",
    name: "Toko Metro",
    description:
      "Training pants, jaket, short pants, polo, dan apparel katalog workshop.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
  },
] as const;

export const categorySlugToName: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.name]),
);

/** Tautan katalog di navbar — selaras dengan route `/(store)/[slug]`. */
export const primaryCatalogNav = [
  { href: "/custom-jersey", label: "Custom Jersey" },
  { href: "/toko-metro", label: "Toko Metro" },
] as const;

/** Breadcrumb / “kembali” dari halaman produk ke daftar kategori yang sesuai. */
export function catalogListPathForCategory(slug?: string | null): string {
  if (slug === "custom-jersey") return "/custom-jersey";
  if (slug === "toko-metro") return "/toko-metro";
  return "/products";
}

export const whyUs = [
  {
    title: "Bahan premium",
    body: "Dryfit premium, Lotto, CVC 24S — sesuai paket yang kamu pilih.",
  },
  {
    title: "Desain custom gratis",
    body: "Tim desain kami bantu layout, typography, dan mockup sampai kamu puas sebelum produksi.",
  },
  {
    title: "Produksi cepat",
    body: "Workflow terstruktur untuk MOQ tim — timeline jelas tanpa drama revisi.",
  },
  {
    title: "Harga transparan",
    body: "Pricelist jelas per paket, opsi kerah & add-on — konfirmasi final via WhatsApp.",
  },
];

/** Ringkasan produk untuk kartu katalog — harga dari varian Medusa (calculated_price). */
export type Product = {
  medusaProductId: string;
  handle: string;
  name: string;
  category: string;
  categorySlug?: string;
  image: string;
  description: string;
  /** Harga terendah varian (IDR) untuk teks “Mulai …” di kartu. */
  minPriceIdr: number | null;
};

export const galleryImages = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=600&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1461896836934-1a4bb36b5a32?w=600&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
];

export const clientLogos = [
  { name: "Nebula FC", abbr: "NF" },
  { name: "Arcadia Esports", abbr: "AE" },
  { name: "SMK Teknika", abbr: "ST" },
  { name: "Kampus Merdeka Run", abbr: "KM" },
  { name: "Jakarta Futsal League", abbr: "JFL" },
  { name: "Hive Community", abbr: "HC" },
];

export const testimonials = [
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
];

export const faqItems = [
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
];
