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
    slug: "jersey",
    name: "Jersey",
    description: "Full custom, tim futsal, football, esports.",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
  },
  {
    slug: "pdh",
    name: "PDH",
    description: "Seragam dinas harian rapi untuk instansi & sekolah.",
    image:
      "https://images.unsplash.com/photo-1594938298603-c814d25835e0?w=800&q=80",
  },
  {
    slug: "polo",
    name: "Polo",
    description: "Corporate & komunitas dengan branding halus.",
    image:
      "https://images.unsplash.com/photo-1586790170083-413f9a6a39ee?w=800&q=80",
  },
  {
    slug: "jaket",
    name: "Jaket",
    description: "Outerwear tim & event dengan detail premium.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  },
];

export const categorySlugToName: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.name]),
);

export const whyUs = [
  {
    title: "Bahan premium",
    body: "Kain dry-fit & drill pilihan yang breathable, tahan lama, dan nyaman dipakai seharian.",
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
    title: "Harga kompetitif",
    body: "Skala B2B & komunitas dengan transparansi harga per qty, tanpa biaya tersembunyi.",
  },
];

export type Product = {
  handle: string;
  name: string;
  category: string;
  image: string;
  description: string;
};

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export const products: Product[] = [
  {
    handle: "pro-kit-esports",
    name: "Pro Kit Esports",
    category: "Jersey",
    image:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=80",
    description:
      "Cutting oversized, panel kontras, dan finishing sublimasi tajam untuk roster kompetitif.",
  },
  {
    handle: "velocity-futsal",
    name: "Velocity Futsal",
    category: "Jersey",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80",
    description:
      "Siluet atletis, ventilasi mesh strategis, dan warna solid untuk performa indoor.",
  },
  {
    handle: "academy-football",
    name: "Academy Football",
    category: "Jersey",
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=80",
    description:
      "Strip klasik dengan tekstur ringan, cocok untuk sekolah & akademi sepak bola.",
  },
  {
    handle: "urban-polo",
    name: "Urban Polo",
    category: "Polo",
    image:
      "https://images.unsplash.com/photo-1622445275571-3f7462c0068c?w=900&q=80",
    description:
      "Pique premium, kerah tegas, branding bordir halus untuk corporate & komunitas.",
  },
  {
    handle: "command-pdh",
    name: "Command PDH",
    category: "PDH",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80",
    description:
      "Set dinas harian formal dengan potongan presisi dan warna institusional konsisten.",
  },
  {
    handle: "night-run-jacket",
    name: "Night Run Jacket",
    category: "Jaket",
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80",
    description:
      "Shell ringan, reflektif minimal, dan aksen neon untuk tim lari & event outdoor.",
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
    a: "Ya. Kami bantu dari konsep, palet warna, typography, hingga mockup 3D. Revisi desain tidak dikenakan biaya tambahan dalam paket standar.",
  },
  {
    q: "Area pengiriman?",
    a: "Seluruh Indonesia via kurir. Untuk Jabodetabek tersedia opsi pickup di workshop kami.",
  },
];
