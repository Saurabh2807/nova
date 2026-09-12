import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enabled native Next.js image optimization for faster loading & compressed assets
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
