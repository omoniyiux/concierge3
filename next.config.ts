import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev indicator sits exactly where the workspace profile row lives.
  devIndicators: false,
  images: {
    // Tutorial covers are the real YouTube thumbnails for each video.
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
  },
};

export default nextConfig;
