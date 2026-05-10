import { cache } from "react";

import {
  clientLogos,
  faqItems,
  galleryImages,
  site,
  testimonials,
} from "@/lib/data/site";
import type { MetroSiteContentV1 } from "@/lib/medusa/site-content-types";

import { sdk } from "./config";

const FALLBACK_WHATSAPP_DIGITS = "6281332079137";

function fallbackSiteContent(): MetroSiteContentV1 {
  return {
    v: 1,
    company: {
      name: site.name,
      tagline: site.tagline,
      address: site.address,
      email: site.email,
      phoneDisplay: site.phoneDisplay,
      whatsappDigits: FALLBACK_WHATSAPP_DIGITS,
      social: {
        instagram: site.social.instagram,
        tiktok: site.social.tiktok,
        facebook: "",
        youtube: "",
      },
    },
    gallery: [...galleryImages],
    heroBackgroundUrls: [],
    clients: clientLogos.map((c) => ({ name: c.name, abbr: c.abbr })),
    testimonials: testimonials.map((t) => ({ ...t })),
    faq: faqItems.map((f) => ({ ...f })),
  };
}

/**
 * Konten landing & kontak dari Medusa Store metadata (Admin → Settings → Konten toko).
 * Di-cache per request RSC; fallback ke `lib/data/site.ts` jika API gagal.
 */
export const getResolvedSiteContent = cache(
  async (): Promise<MetroSiteContentV1> => {
    if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      return fallbackSiteContent();
    }
    try {
      const res = await sdk.client.fetch<{ content: MetroSiteContentV1 }>(
        "/store/metro-site-content",
        { method: "GET", cache: "no-store" },
      );
      if (res?.content?.v === 1) return res.content;
    } catch {
      /* gunakan fallback */
    }
    return fallbackSiteContent();
  },
);
