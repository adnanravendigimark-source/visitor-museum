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
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
