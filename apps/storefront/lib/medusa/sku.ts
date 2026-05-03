/** Harus sama dengan pola SKU di `apps/backend/.../initial-data-seed.ts` (`buildVariants`). */
export function metroVariantSku(
  productHandle: string,
  tierId: string,
  size: string,
): string {
  return `${productHandle}-${tierId}-${size}`.toUpperCase();
}
