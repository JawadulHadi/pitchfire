import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typedRoutes: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || "http://localhost:3001",
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_JAZZCASH_MERCHANT_ID: process.env.JAZZCASH_MERCHANT_ID || "",
  },
};

export default nextConfig;
