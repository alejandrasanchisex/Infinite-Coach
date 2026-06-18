import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "licencias.ingeniaia.es"
          }
        ],
        destination: "/admin-login.html"
      }
    ];
  }
};

export default nextConfig;
