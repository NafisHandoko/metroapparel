import Link from "next/link";

import { site } from "@/lib/data/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-lg text-foreground">{site.name}</p>
            <p className="mt-2 max-w-xs text-sm text-muted">{site.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Kontak
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="hover:text-foreground"
                >
                  {site.email}
                </a>
              </li>
              <li>{site.phoneDisplay}</li>
              <li className="max-w-xs leading-relaxed">{site.address}</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Sosial
            </p>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm">
              <li>
                <Link
                  href={site.social.instagram}
                  className="text-muted hover:text-foreground"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href={site.social.tiktok}
                  className="text-muted hover:text-foreground"
                  target="_blank"
                  rel="noreferrer"
                >
                  TikTok
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-muted/80">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
