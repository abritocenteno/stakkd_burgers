import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Convex storage
      { protocol: "https", hostname: "*.convex.cloud" },
      { protocol: "http", hostname: "127.0.0.1" },
      // Clerk user avatars
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default nextConfig;
