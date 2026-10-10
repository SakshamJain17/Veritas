import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_PUBLIC_DEMO: process.env.VERCEL === "1" ? "true" : "false" },
};

export default nextConfig;
