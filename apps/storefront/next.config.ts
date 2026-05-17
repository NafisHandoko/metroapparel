import type { NextConfig } from "next";
// const checkEnvVariables = require("./check-env-variables");

// checkEnvVariables();

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    /**
     * Tanpa ini, optimizer `/_next/image` menolak URL yang setelah DNS resolve ke IP
     * privat (mis. `localhost` → 127.0.0.1) dengan 400 "url" parameter is not allowed —
     * meskipun host sudah ada di `remotePatterns`. Hati-hati di production: jangan aktifkan
     * kecuali sumber gambar Anda memang internal dan Anda sadar risikonya.
     */
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV === "development" ||
      process.env.IMAGES_ALLOW_LOCAL_IP === "true",
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      /**
       * Tanpa `port`, Next hanya mengizinkan port default HTTP (80). File static Medusa
       * biasanya di `http://localhost:9000/static/...` → harus diizinkan eksplisit.
       */
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
      /** SSR / fetch gambar dari container Next ke container Medusa (Docker Compose). */
      {
        protocol: "http",
        hostname: "medusa",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "admin.metroapparel.web.id",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
