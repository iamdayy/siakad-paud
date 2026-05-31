import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hanya gunakan standalone jika sedang di build untuk Docker
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
};

export default nextConfig;
