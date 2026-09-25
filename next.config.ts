import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js App Router injects inline bootstrap scripts, so 'unsafe-inline' is
// required for scripts until we move to nonce-based CSP. Everything else is
// locked to our own origin plus the two third parties we actually use:
// Meta Pixel (only after consent) and Vercel Web Analytics / Speed Insights.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://connect.facebook.net https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.facebook.com https://connect.facebook.net https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const baseHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Private areas: never cached by shared caches, never indexed, no referrer leaks.
const privateHeaders = [
  { key: "Cache-Control", value: "no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: baseHeaders },
      { source: "/backoffice", headers: privateHeaders },
      { source: "/admin", headers: privateHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/api/:path*", headers: privateHeaders },
      // Everything served from the backoffice subdomain is private.
      {
        source: "/:path*",
        has: [{ type: "host", value: "backoffice.buddylife.am" }],
        headers: privateHeaders,
      },
    ];
  },
};

export default nextConfig;
