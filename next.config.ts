import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    domains: [
      "gcp-na-images.contentstack.com",
      "images.unsplash.com",
    ],
  },
};

export default nextConfig;
