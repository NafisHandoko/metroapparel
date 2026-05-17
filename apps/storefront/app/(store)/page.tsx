import { CtaSection } from "@/components/sections/cta-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import {
  FAQJsonLd,
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/components/seo/json-ld";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  return {
    title: `${content.company.name} — Custom Jersey & Apparel Jombang`,
    description: `${content.company.tagline} Melayani pembuatan jersey custom untuk tim futsal, sepakbola, badminton, esports, dan komunitas di Jombang dan sekitarnya.`,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: `${content.company.name} — Custom Jersey & Apparel Jombang`,
      description: `${content.company.tagline} Melayani pembuatan jersey custom untuk tim futsal, sepakbola, badminton, esports, dan komunitas.`,
      url: siteUrl,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const content = await getResolvedSiteContent();

  return (
    <>
      <OrganizationJsonLd content={content} />
      <WebsiteJsonLd companyName={content.company.name} />
      <FAQJsonLd faqs={content.faq} />
      <HeroSection />
      <SocialProofSection />
      <FeaturedProductsSection />
      <WhyUsSection />
      <GallerySection />
      <ClientsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
