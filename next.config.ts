import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.prosper-mfg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "prosper-mfg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
