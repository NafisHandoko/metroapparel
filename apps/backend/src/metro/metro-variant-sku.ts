/**
 * SKU = satu varian per paket (`{handle}-{tierId}`), selaras dengan seed `buildVariants`
 * dan `apps/storefront/lib/medusa/sku.ts`. Ukuran & oversize hanya di metadata baris keranjang.
 */
export function metroVariantSku(productHandle: string, tierId: string): string {
  return `${productHandle}-${tierId}`.toUpperCase();
}
