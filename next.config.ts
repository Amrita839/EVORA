import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo/sample product imagery ships as local SVG placeholders — the
    // owner will replace these with real photography via Admin → Products,
    // typically served from Supabase Storage (add that hostname below).
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
