import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev indicator sits exactly where the workspace profile row lives.
  devIndicators: false,
  images: {
    // Tutorial covers are the real YouTube thumbnails for each video.
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
  },

  /**
   * Site Brain, Actions and Routing each used to answer at two URLs — once as
   * a rail destination and once as an Agent tab. The Agent tab won; these
   * catch anything still pointing at the old address.
   *
   * Deliberately not `permanent`: a 308 is cached by the browser forever, and
   * the IA is still moving. Make them permanent once it has settled.
   */
  redirects() {
    return ["brain", "actions", "routing"].flatMap((surface) => [
      {
        source: `/sites/:siteId/${surface}`,
        destination: `/sites/:siteId/agent/${surface}`,
        permanent: false,
      },
      {
        source: `/sites/:siteId/${surface}/:path*`,
        destination: `/sites/:siteId/agent/${surface}/:path*`,
        permanent: false,
      },
    ]);
  },
};

export default nextConfig;
