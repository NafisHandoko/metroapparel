"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/components/site-content-provider";
import { primaryCatalogNav } from "@/lib/data/site";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Beranda" },
  ...primaryCatalogNav,
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
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/15 text-foreground transition-colors duration-300 hover:border-brand/50 hover:bg-white/5"
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

export function SiteHeaderClient({ itemCount }: { itemCount: number }) {
  const { company } = useSiteContent();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500 ease-out",
        scrolled
          ? "border-white/10 bg-background/72 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent shadow-none backdrop-blur-0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/"
            className="relative block h-9 w-36 shrink-0 sm:h-10 sm:w-44"
          >
            <Image
              src="/logo-with-text.png"
              alt={`${company.name} - beranda`}
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 144px, 176px"
              priority
            />
          </Link>
        </motion.div>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-muted transition-colors duration-300 after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand/70 after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100"
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
                `Halo ${company.name}, saya ingin konsultasi jersey custom.`,
                company.whatsappDigits,
              )}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </Button>
          <details className="relative md:hidden">
            <summary className="list-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-white/15 px-3 text-sm font-medium text-foreground transition-colors duration-300 hover:border-brand/40">
                Menu
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-surface/95 p-2 shadow-xl backdrop-blur-md">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={getWhatsAppLink(
                  `Halo ${company.name}, saya ingin konsultasi jersey custom.`,
                  company.whatsappDigits,
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
    </motion.header>
  );
}
