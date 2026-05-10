const DEFAULT_WHATSAPP_DIGITS = "6281332079137";

function normalizeDigits(digits?: string): string {
  if (!digits?.trim()) return DEFAULT_WHATSAPP_DIGITS;
  const cleaned = digits.replace(/\D/g, "");
  return cleaned.length >= 8 ? cleaned : DEFAULT_WHATSAPP_DIGITS;
}

/** `phoneDigits` = angka wa.me tanpa + (contoh 6281234567890). */
export function getWhatsAppLink(message?: string, phoneDigits?: string): string {
  const base = `https://wa.me/${normalizeDigits(phoneDigits)}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
