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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, follow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/category/:slug",
        destination: "/topic/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
