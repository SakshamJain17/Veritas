import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_PUBLIC_DEMO: process.env.VERCEL === "1" ? "true" : "false" },
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    if (process.env.VERCEL === "1") return [];
    const backend = process.env.VERITAS_BACKEND_URL || "http://127.0.0.1:49001";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
