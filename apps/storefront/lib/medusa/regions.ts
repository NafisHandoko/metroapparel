import type { HttpTypes } from "@medusajs/types";

import { sdk } from "@/lib/medusa/config";

const regionByCountry = new Map<string, HttpTypes.StoreRegion>();

export async function listRegions(): Promise<HttpTypes.StoreRegion[]> {
  const { regions } = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(
    "/store/regions",
    {
      method: "GET",
      query: {
        fields: "+countries,*countries",
      },
      cache: "no-store",
    },
  );
  return regions ?? [];
}

export async function getRegion(
  countryCode: string,
): Promise<HttpTypes.StoreRegion | null> {
  const key = countryCode.toLowerCase();
  if (regionByCountry.has(key)) {
    return regionByCountry.get(key) ?? null;
  }

  const regions = await listRegions();
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      const iso = c?.iso_2?.toLowerCase();
      if (iso) regionByCountry.set(iso, region);
    });
  });

  const match = regionByCountry.get(key);
  if (match) return match;

  // Satu region di DB tetapi negara tidak ikut di response API — tetap bisa dipakai untuk harga.
  return regions[0] ?? null;
}

export function defaultCountryCode(): string {
  return (process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "id").toLowerCase();
}
