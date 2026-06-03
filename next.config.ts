import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'unajyjjxwcnqxmyljnoc.supabase.co',
  //       pathname: '/storage/v1/object/public/**',
  //     },
  //   ],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
