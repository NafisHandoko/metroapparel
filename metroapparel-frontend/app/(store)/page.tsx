import { CtaSection } from "@/components/sections/cta-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { site } from "@/lib/data/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${site.name} — Custom Jersey & Apparel`,
  description: site.tagline,
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <CategoriesSection />
      <WhyUsSection />
      <FeaturedProductsSection />
      <GallerySection />
      <ClientsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
