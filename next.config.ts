import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2", "bcryptjs", "stripe"],
  allowedDevOrigins: ["173.249.12.16", "173.249.12.16.nip.io", "localhost"],
};

export default nextConfig;
