export const sponsorshipPath = "/program-sponsorship" as const;

export const sponsorshipSteps = [
  {
    title: "Ajukan proposal",
    body: "Ceritakan event, tanggal, skala peserta, dan kebutuhan dukungan lewat WhatsApp.",
  },
  {
    title: "Review & diskusi",
    body: "Tim kami meninjau kesesuaian dan membahas bentuk dukungan — dana, produk, atau branding di event.",
  },
  {
    title: "Kesepakatan & eksekusi",
    body: "Setelah deal, Metro Apparel hadir sebagai sponsor di event kamu sesuai kesepakatan bersama.",
  },
] as const;

export const sponsorshipAudiences = [
  "Turnamen atau lomba olahraga sekolah & kampus",
  "Acara organisasi kemahasiswaan (BEM, UKM, panitia, dll.)",
  "Festival komunitas, fun run, dan charity event",
  "Event dengan exposure brand yang selaras dengan apparel & sportswear",
] as const;

export const sponsorshipChecklist = [
  "Nama dan jenis event",
  "Tanggal serta lokasi penyelenggaraan",
  "Institusi atau penyelenggara (sekolah / kampus / komunitas)",
  "Estimasi peserta atau audience",
  "Proposal singkat (opsional: rundown, benefit untuk sponsor)",
] as const;

export const sponsorshipFaq = [
  {
    q: "Apa bedanya dengan logo sponsor di jersey custom?",
    a: "Program ini untuk kerjasama sponsorship event (dukungan event & brand recognition). Logo sponsor di jersey adalah add-on terpisah saat order produk custom di toko.",
  },
  {
    q: "Apakah semua pengajuan pasti disetujui?",
    a: "Setiap ajuan kami review berdasarkan kesesuaian brand, jadwal, dan kapasitas tim. Tidak semua event bisa kami dukung, tetapi kami akan membalas dengan jelas.",
  },
  {
    q: "Bentuk dukungan apa saja yang bisa diberikan?",
    a: "Bisa berupa dukungan dana, produk apparel, atau penempatan brand Metro di materi event — detailnya disepakati lewat diskusi dengan panitia.",
  },
  {
    q: "Berapa lama proses review?",
    a: "Tergantung kelengkapan informasi. Umumnya kami membalas dalam beberapa hari kerja setelah pengajuan lengkap masuk via WhatsApp.",
  },
] as const;

export function getSponsorshipWhatsAppMessage(companyName: string): string {
  return `Halo ${companyName}, saya ingin mengajukan kerjasama sponsorship untuk event [nama event] di [kampus/sekolah/organisasi] pada [tanggal]. Mohon info syarat dan langkah selanjutnya.`;
}
