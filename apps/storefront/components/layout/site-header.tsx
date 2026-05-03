import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { retrieveMetroCart } from "@/lib/medusa/cart-server";
import { getWhatsAppLink } from "@/lib/whatsapp";

const nav = [
  { href: "/#categories", label: "Kategori" },
  { href: "/products", label: "Produk" },
  { href: "/#why", label: "Keunggulan" },
  { href: "/#faq", label: "FAQ" },
];

function CartHeaderLink({ itemCount }: { itemCount: number }) {
  const label =
    itemCount > 0
      ? `Keranjang, ${itemCount} produk`
      : "Keranjang";

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/15 text-foreground transition-colors hover:border-brand/50 hover:bg-white/5"
      aria-label={label}
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={2} aria-hidden />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold tabular-nums leading-none text-background">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

export async function SiteHeader() {
  const cart = await retrieveMetroCart();
  const itemCount =
    cart?.items?.reduce((sum, line) => sum + (line.quantity ?? 0), 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative block h-9 w-36 shrink-0 sm:h-10 sm:w-44">
          <Image
            src="/logo-with-text.png"
            alt={`${site.name} - beranda`}
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
          <CartHeaderLink itemCount={itemCount} />
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
