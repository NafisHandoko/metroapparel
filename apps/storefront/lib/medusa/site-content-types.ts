/** Bentuk respons `GET /store/metro-site-content` — selaras dengan `metro-site-content.ts` di backend. */

export type MetroSiteCompanyV1 = {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phoneDisplay: string;
  whatsappDigits: string;
  social: {
    instagram: string;
    tiktok: string;
    facebook?: string;
    youtube?: string;
  };
};

export type MetroSiteClientV1 = { name: string; abbr: string };

export type MetroSiteTestimonialV1 = {
  name: string;
  role: string;
  message: string;
  initials: string;
};

export type MetroSiteFaqV1 = { q: string; a: string };

export type MetroSiteContentV1 = {
  v: 1;
  company: MetroSiteCompanyV1;
  gallery: string[];
  clients: MetroSiteClientV1[];
  testimonials: MetroSiteTestimonialV1[];
  faq: MetroSiteFaqV1[];
};
