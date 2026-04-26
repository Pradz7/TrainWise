import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.100.50",
    "172.20.10.9",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;