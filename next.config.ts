import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80, 90],
  },
  poweredByHeader: false,
};

export default nextConfig;
