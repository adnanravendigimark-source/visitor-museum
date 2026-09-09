/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
    // Inlines critical above-the-fold CSS and loads the rest async, so the
    // main stylesheet stops render-blocking the first paint. Requires the
    // `critters` package — run `npm install` before your next build/dev,
    // otherwise Next will fail to start with a missing-module error.
    optimizeCss: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // AVIF is dropped: Sharp's AVIF encoder is dramatically slower than
    // WebP for little visible gain at these image sizes, and it was the
    // main reason local image loads felt "very very slow" — every
    // first-view of an image was blocking on a slow AVIF re-encode.
    formats: ["image/webp"],
    // Image optimization (download + resize + re-encode via Sharp) is
    // only worth paying for in production, where the optimized/cached
    // result is reused by every visitor. In local dev it reruns on every
    // uncached request and was the direct cause of the slow image loads
    // reported here — skip it in dev and serve the source file as-is.
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
