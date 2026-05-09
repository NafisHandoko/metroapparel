/** Selaras dengan pola SKU di seed backend `buildVariants` dan `metro-variant-sku.ts`. */
export function metroVariantSku(productHandle: string, tierId: string): string {
  return `${productHandle}-${tierId}`.toUpperCase();
}
