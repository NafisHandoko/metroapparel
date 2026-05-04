/** Harus sama dengan `apps/storefront/lib/medusa/sku.ts` dan seed `buildVariants`. */
export function metroVariantSku(
  productHandle: string,
  tierId: string,
  size: string,
): string {
  return `${productHandle}-${tierId}-${size}`.toUpperCase();
}
