import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.BACKEND_INTERNAL_URL || "http://localhost:8080/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;