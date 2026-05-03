import type { ProductKind } from "@/lib/data/catalog";

export const site = {
  name: "Metro Apparel",
  tagline: "Custom jersey & apparel produksi lokal, kualitas premium.",
  address: "Jl. Industri Raya No. 88, Tangerang Selatan 15314, Indonesia",
  email: "halo@metroapparel.id",
  phoneDisplay: "+62 812-3456-7890",
  social: {
    instagram: "https://instagram.com/metroapparel",
    tiktok: "https://tiktok.com/@metroapparel",
  },
};

export const stats = [
  { value: "1000+", label: "Jersey telah diproduksi" },
  { value: "50+", label: "Tim & instansi mempercayai kami" },
  { value: "7–14", label: "Hari produksi rata-rata" },
];

export const categories = [
  {
    slug: "jersey-atasan",
    name: "Jersey Atasan",
    description: "Essential, Elite, Prime — custom tim & komunitas.",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
  },
  {
    slug: "jersey-satu-set",
    name: "Jersey Satu Set",
    description: "Regular hingga Ultimate — full set match & esports.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  },
  {
    slug: "training-pants",
    name: "Training Pants",
    description: "Lotto — full print atau non printing.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
  },
  {
    slug: "jaket",
    name: "Jaket",
    description: "Lotto — printing atau non printing + bordir.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  },
  {
    slug: "short-pants",
    name: "Short Pants",
    description: "Lotto — full print atau print samping.",
    image:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
  },
  {
    slug: "polo",
    name: "Polo",
    description: "CVC 24S — polo bordir untuk corporate & komunitas.",
    image:
      "https://images.unsplash.com/photo-1622445275571-3f7462c0068c?w=800&q=80",
  },
];

export const categorySlugToName: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.name]),
);

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

export type Product = {
  handle: string;
  name: string;
  category: string;
  image: string;
  description: string;
  kind: ProductKind;
};

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export const products: Product[] = [
  {
    handle: "jersey-atasan",
    name: "Jersey Atasan",
    category: "Jersey Atasan",
    kind: "jersey-top",
    image:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=80",
    description:
      "Produk utama: jersey bagian atas dengan tiga paket — Essential, Elite, dan Prime. Pilih kerah, ukuran, oversize, dan add-on; ringkasan bisa langsung dikirim ke WhatsApp.",
  },
  {
    handle: "jersey-satu-set",
    name: "Jersey Satu Set",
    category: "Jersey Satu Set",
    kind: "jersey-set",
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=80",
    description:
      "Set lengkap atasan + celana: Regular (Basic), Standard (paling populer), Premium, dan Ultimate. Cocok untuk match day, liga, dan tim esports.",
  },
  {
    handle: "training-pants",
    name: "Training Pants",
    category: "Training Pants",
    kind: "training-pants",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80",
    description:
      "Celana training bahan Lotto: opsi full printing atau non printing. Pilih ukuran & add-on di bawah.",
  },
  {
    handle: "jaket",
    name: "Jaket",
    category: "Jaket",
    kind: "jacket",
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80",
    description:
      "Jaket bahan Lotto: varian printing atau non printing + bordir. Pilih paket, ukuran, dan opsi tambahan.",
  },
  {
    handle: "short-pants",
    name: "Short Pants",
    category: "Short Pants",
    kind: "short-pants",
    image:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900&q=80",
    description:
      "Celana pendek Lotto: full printing atau print samping.",
  },
  {
    handle: "polo",
    name: "Polo",
    category: "Polo",
    kind: "polo",
    image:
      "https://images.unsplash.com/photo-1622445275571-3f7462c0068c?w=900&q=80",
    description:
      "Polo bordir material CVC 24S — untuk corporate, sekolah, dan komunitas.",
  },
];

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
    a: "Seluruh Indonesia via kurir. Untuk Jabodetabek tersedia opsi pickup di workshop kami.",
  },
];
