import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_BASE}/api/:path*` },
    ];
  },
  reactStrictMode: true,
};

export default nextConfig;