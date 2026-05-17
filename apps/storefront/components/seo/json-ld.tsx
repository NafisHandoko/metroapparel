import type { MetroSiteContentV1 } from "@/lib/medusa/site-content-types";
import type { Product } from "@/lib/data/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

export type OrganizationJsonLdProps = {
  content: MetroSiteContentV1;
};

export function OrganizationJsonLd({ content }: OrganizationJsonLdProps) {
  const { company } = content;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#organization`,
    name: company.name,
    description: company.tagline,
    url: siteUrl,
    telephone: company.phoneDisplay,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: "Jombang",
      addressRegion: "Jawa Timur",
      postalCode: "61471",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -7.6186065416453,
      longitude: 112.25821993712866,
    },
    image: `${siteUrl}/og-image.jpg`,
    logo: `${siteUrl}/logo.png`,
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "16:00",
      },
    ],
    sameAs: [
      company.social.instagram,
      company.social.tiktok,
      company.social.facebook,
      company.social.youtube,
    ].filter(Boolean),
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: -7.6186065416453,
        longitude: 112.25821993712866,
      },
      geoRadius: "100000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Produk Metro Apparel",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Custom Jersey",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Jersey Atasan Custom",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Jersey Satu Set Custom",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Toko Metro",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Training Pants",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Jaket Tim",
              },
            },
          ],
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export type WebsiteJsonLdProps = {
  companyName: string;
};

export function WebsiteJsonLd({ companyName }: WebsiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: companyName,
    description: "Custom jersey & apparel produksi lokal, kualitas premium.",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export type FAQJsonLdProps = {
  faqs: Array<{ q: string; a: string }>;
};

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export type ProductJsonLdProps = {
  product: Product;
  companyName: string;
  fullUrl: string;
};

export function ProductJsonLd({ product, companyName, fullUrl }: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": fullUrl,
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: companyName,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: fullUrl,
      priceCurrency: "IDR",
      price: product.minPriceIdr ?? 0,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: companyName,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export type BreadcrumbJsonLdProps = {
  items: Array<{ name: string; url: string }>;
};

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
