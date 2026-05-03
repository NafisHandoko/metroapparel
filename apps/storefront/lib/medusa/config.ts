import Medusa from "@medusajs/js-sdk";

/**
 * Server (Docker): set `MEDUSA_BACKEND_INTERNAL_URL=http://medusa:9000`.
 * Browser hanya memakai `NEXT_PUBLIC_*` — jangan set publik ke `http://medusa:9000`.
 */
const medusaBaseUrl =
  process.env.MEDUSA_BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://localhost:9000";

export const sdk = new Medusa({
  baseUrl: medusaBaseUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});
