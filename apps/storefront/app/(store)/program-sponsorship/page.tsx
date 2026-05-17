import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo/json-ld";
import {
  getSponsorshipWhatsAppMessage,
  sponsorshipAudiences,
  sponsorshipChecklist,
  sponsorshipSteps,
} from "@/lib/data/sponsorship";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import { getWhatsAppLink } from "@/lib/whatsapp";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedSiteContent();
  const description = `Program sponsorship ${content.company.name} untuk sekolah, kampus, dan komunitas. Ajukan kerjasama event dan dapatkan dukungan jersey & apparel dengan timbal balik brand recognition.`;

  return {
    title: `Program Sponsorship — ${content.company.name}`,
    description,
    alternates: {
      canonical: `${siteUrl}/program-sponsorship`,
    },
    openGraph: {
      title: `Program Sponsorship — ${content.company.name}`,
      description,
      url: `${siteUrl}/program-sponsorship`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Program Sponsorship — ${content.company.name}`,
      description,
    },
  };
}

export default async function ProgramSponsorshipPage() {
  const { company, sponsorshipFaq } = await getResolvedSiteContent();
  const waHref = getWhatsAppLink(
    getSponsorshipWhatsAppMessage(company.name),
    company.whatsappDigits,
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: siteUrl },
          { name: "Program Sponsorship", url: `${siteUrl}/program-sponsorship` },
        ]}
      />
      <FAQJsonLd faqs={sponsorshipFaq} />
      <div className="border-b border-white/10 pb-24">
      <section className="pt-12 sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Program Sponsorship
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Dukung event kamu, tumbuh bareng {company.name}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            Untuk panitia sekolah, kampus, atau komunitas yang menyelenggarakan event
            dan membutuhkan sponsor. Metro Apparel mendukung event kamu; sebagai timbal
            balik, brand kami tampil di event tersebut.
          </p>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Cara kerja
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {sponsorshipSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6"
              >
                <span className="text-xs font-semibold tabular-nums text-brand">
                  Langkah {index + 1}
                </span>
                <h3 className="mt-2 font-display text-xl text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
                Event seperti apa yang cocok?
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {sponsorshipAudiences.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-surface/40 p-6 sm:p-8">
              <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
                Yang perlu disiapkan
              </h2>
              <p className="mt-2 text-sm text-muted">
                Semakin lengkap informasinya, semakin cepat kami bisa meninjau pengajuanmu.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {sponsorshipChecklist.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-brand/40 text-[10px] font-bold text-brand"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Pertanyaan umum
          </h2>
          <Accordion type="single" collapsible className="mt-8 w-full">
            {sponsorshipFaq.map((item, i) => (
              <AccordionItem key={item.q} value={`sponsorship-faq-${i}`}>
                <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mt-16 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/12 via-surface to-background px-6 py-14 text-center shadow-[0_0_60px_-20px_rgba(158,255,0,0.35)] sm:px-12 sm:py-16">
            <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Siap mengajukan sponsorship?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted sm:text-base">
              Hubungi kami via WhatsApp. Tim akan membalas dan mendiskusikan bentuk
              kerjasama yang sesuai dengan event kamu.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="xl" className="shadow-[0_0_40px_-6px_rgba(158,255,0,0.55)]">
                <a href={waHref} target="_blank" rel="noreferrer">
                  Hubungi kami untuk lebih lanjut
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
