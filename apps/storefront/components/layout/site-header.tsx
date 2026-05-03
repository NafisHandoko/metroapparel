import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { site } from "@/lib/data/site";

const nav = [
  { href: "/#categories", label: "Kategori" },
  { href: "/products", label: "Produk" },
  { href: "/cart", label: "Keranjang" },
  { href: "/#why", label: "Keunggulan" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative block h-9 w-36 shrink-0 sm:h-10 sm:w-44">
          <Image
            src="/logo-with-text.png"
            alt={`${site.name} — beranda`}
            fill
            className="object-contain object-left"
            sizes="(max-width: 640px) 144px, 176px"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a
              href={getWhatsAppLink(
                `Halo ${site.name}, saya ingin konsultasi jersey custom.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </Button>
          <details className="relative md:hidden">
            <summary className="list-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-white/15 px-3 text-sm font-medium text-foreground">
                Menu
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-surface p-2 shadow-xl">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={getWhatsAppLink(
                  `Halo ${site.name}, saya ingin konsultasi jersey custom.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-background"
              >
                WhatsApp
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
