import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware untuk rewrite URL gambar di development Docker environment.
 *
 * Problem:
 * - Image URLs dari Medusa API berisi `localhost:9000`
 * - Browser bisa akses `localhost:9000` ✓
 * - Next.js Image Optimizer (di dalam container) tidak bisa akses `localhost:9000`
 *   karena `localhost` di container = container itu sendiri ✗
 *
 * Solution:
 * - Intercept request ke `/_next/image`
 * - Rewrite `url` parameter dari `localhost:9000` ke `medusa:9000`
 * - Next.js optimizer bisa fetch dari Docker network
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Hanya proses request ke image optimizer
  if (pathname !== "/_next/image") {
    return NextResponse.next();
  }

  const imageUrl = searchParams.get("url");
  if (!imageUrl) {
    return NextResponse.next();
  }

  // Cek apakah URL mengarah ke Medusa local (development)
  const isLocalMedusaUrl =
    imageUrl.includes("localhost:9000") || imageUrl.includes("127.0.0.1:9000");

  if (!isLocalMedusaUrl) {
    return NextResponse.next();
  }

  // Rewrite URL ke internal Docker hostname
  const internalUrl = process.env.MEDUSA_BACKEND_INTERNAL_URL;
  if (!internalUrl) {
    // Tidak ada internal URL configured - biarkan request lewat apa adanya
    return NextResponse.next();
  }

  const rewrittenImageUrl = imageUrl
    .replace("http://localhost:9000", internalUrl)
    .replace("http://127.0.0.1:9000", internalUrl);

  // Buat URL baru dengan parameter yang sudah di-rewrite
  const newUrl = request.nextUrl.clone();
  newUrl.searchParams.set("url", rewrittenImageUrl);

  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: "/_next/image",
};
