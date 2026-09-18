import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.69"],
  serverExternalPackages: ["node-cron", "nodemailer"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.brs.devtunnels.ms"],
    },
  },
};

export default nextConfig;
