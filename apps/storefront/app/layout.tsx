import type { Metadata, Viewport } from "next";
import { DM_Sans, Oswald } from "next/font/google";

import "./globals.css";
import { site } from "@/lib/data/site";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metroapparel.web.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Custom Jersey & Apparel Jombang`,
    template: `%s — ${site.name}`,
  },
  description: `${site.tagline} Melayani pembuatan jersey custom untuk tim futsal, sepakbola, badminton, esports, dan komunitas di Jombang dan sekitarnya.`,
  keywords: [
    "custom jersey",
    "jersey custom",
    "jersey tim",
    "jersey futsal",
    "jersey sepakbola",
    "jersey esports",
    "jersey badminton",
    "jersey komunitas",
    "konveksi jersey",
    "konveksi jombang",
    "apparel custom",
    "training pants",
    "jaket tim",
    "metro apparel",
    "jersey jombang",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} — Custom Jersey & Apparel Jombang`,
    description: `${site.tagline} Melayani pembuatan jersey custom untuk tim futsal, sepakbola, badminton, esports, dan komunitas di Jombang dan sekitarnya.`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name} - Custom Jersey & Apparel`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Custom Jersey & Apparel Jombang`,
    description: `${site.tagline} Melayani pembuatan jersey custom untuk tim futsal, sepakbola, badminton, esports, dan komunitas di Jombang dan sekitarnya.`,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "fashion",
};

export const viewport: Viewport = {
  themeColor: "#9EFF00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${oswald.variable} ${dmSans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
