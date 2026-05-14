import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";
import { getWhatsAppLink } from "@/lib/whatsapp";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const content = await getResolvedSiteContent();
  return {
    title: `Pesanan ${id} — ${content.company.name}`,
  };
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { id } = await params;
  const content = await getResolvedSiteContent();
  const { company } = content;
  const wa = getWhatsAppLink(
    `Halo ${company.name}, saya baru checkout di web. No. order Medusa: ${id}. Mohon konfirmasi pembayaran & produksi.`,
    company.whatsappDigits,
  );

  return (
    <div className="border-b border-white/10 pb-24 pt-12">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Berhasil</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-foreground">
          Pesanan telah dibuat
        </h1>
        <p className="mt-4 text-sm text-muted">
          ID pesanan Metro:{" "}
          <span className="font-mono text-foreground">{id}</span>. Simpan ID ini untuk komunikasi dengan admin.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <a href={wa} target="_blank" rel="noreferrer">
              Lanjutkan ke WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">Belanja lagi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
