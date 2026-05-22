import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Beget Docker: не плодить много worker-потоков при сборке
    cpus: 1,
  },
  outputFileTracingIncludes: {
    "/*": [
      "./app/generated/prisma/**/*",
      "./node_modules/@prisma/client/**/*",
      "./node_modules/@prisma/adapter-mariadb/**/*",
      "./node_modules/mariadb/**/*",
    ],
  },
  async redirects() {
    return [
      {
        source: "/vse-uslugi/:slug",
        destination: "/services/:slug",
        permanent: true,
      },
      {
        source: "/reviews",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
