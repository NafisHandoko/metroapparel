import type { NextConfig } from "next";
// const checkEnvVariables = require("./check-env-variables");

// checkEnvVariables();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
