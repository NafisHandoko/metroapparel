"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { useSiteContent } from "@/components/site-content-provider";

export function FaqSection() {
  const { faq: faqItems } = useSiteContent();
  return (
    <section id="faq" className="scroll-mt-24 border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Sebelum kamu order
          </h2>
          <p className="mt-3 text-muted">
            Jawaban singkat untuk pertanyaan yang paling sering masuk ke tim kami.
          </p>
        </Reveal>
        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqItems.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
