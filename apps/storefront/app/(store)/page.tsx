import { CtaSection } from "@/components/sections/cta-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  return {
    title: `${content.company.name} — Custom Jersey & Apparel`,
    description: content.company.tagline,
  };
}

export default function HomePage() {
  return (
    <>
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
