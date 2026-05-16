"use client";

import Link from "next/link";

import { useSiteContent } from "@/components/site-content-provider";
import { sponsorshipPath } from "@/lib/data/sponsorship";

export function SiteFooter() {
  const { company } = useSiteContent();
  const social = company.social;

  return (
    <footer className="border-t border-white/10 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-display text-lg text-foreground">{company.name}</p>
            <p className="mt-2 max-w-xs text-sm text-muted">{company.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Program
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={sponsorshipPath}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  Program Sponsorship
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Kontak
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-foreground"
                >
                  {company.email}
                </a>
              </li>
              <li>{company.phoneDisplay}</li>
              <li className="max-w-xs leading-relaxed">{company.address}</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Sosial
            </p>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm">
              {social.instagram?.trim() ? (
                <li>
                  <Link
                    href={social.instagram.trim()}
                    className="text-muted hover:text-foreground"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </Link>
                </li>
              ) : null}
              {social.tiktok?.trim() ? (
                <li>
                  <Link
                    href={social.tiktok.trim()}
                    className="text-muted hover:text-foreground"
                    target="_blank"
                    rel="noreferrer"
                  >
                    TikTok
                  </Link>
                </li>
              ) : null}
              {social.facebook?.trim() ? (
                <li>
                  <Link
                    href={social.facebook.trim()}
                    className="text-muted hover:text-foreground"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Facebook
                  </Link>
                </li>
              ) : null}
              {social.youtube?.trim() ? (
                <li>
                  <Link
                    href={social.youtube.trim()}
                    className="text-muted hover:text-foreground"
                    target="_blank"
                    rel="noreferrer"
                  >
                    YouTube
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-muted/80">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
