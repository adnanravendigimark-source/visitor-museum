/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // staleTimes: { dynamic: 0, static: 0 } used to live here, disabling
    // the client-side Router Cache entirely — every Link navigation
    // re-fetched the destination page from the server from scratch, even
    // for pages that hadn't changed at all. Combined with force-dynamic on
    // every page (see app/layout.tsx), this meant zero caching anywhere in
    // the stack. Now that pages are statically cached and invalidated on
    // demand via revalidatePath (which busts the Router Cache for the
    // affected route immediately, same as it busts the server-side cache),
    // there's no reason to disable the client cache too — removing this
    // lets Next use its own sane defaults (30s for dynamic segments, 5min
    // for static ones).
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
    // Once an optimized/resized image is generated in production, keep
    // serving that cached copy for a full day instead of Next's much
    // shorter default — museum/tour/blog photos rarely change minute to
    // minute, so this avoids needlessly re-running Sharp on repeat visits.
    minimumCacheTTL: 60 * 60 * 24,
  },
  // Baseline security headers applied to every response site-wide. None of
  // these change behavior for a normal visitor or the admin — they only
  // constrain what a malicious page/response is allowed to do. A full
  // Content-Security-Policy is intentionally NOT included here: this app
  // renders several inline <script>/<style> tags (JSON-LD, Google
  // Analytics, the theme-color <style>) that a strict CSP would need
  // nonces to allow, and getting that wrong would silently break pages
  // rather than fail loudly — worth doing as a deliberate follow-up with
  // its own testing pass, not bundled into a perf/security sweep.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevents this site from being framed by another origin
          // (clickjacking protection) — nothing here legitimately needs
          // to be embedded in an <iframe> on someone else's page.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stops browsers from "sniffing" a response into a different
          // content type than the one declared — closes off a class of
          // attacks around user-uploaded files (see /api/admin/upload).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the full referrer to same-origin requests but only the
          // origin (no path/query) cross-origin — avoids leaking internal
          // URLs/params to third-party sites via the Referer header.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // This site never needs camera/mic/geolocation access itself;
          // explicitly denying them stops an embedded third-party script
          // from ever requesting them on this origin's behalf.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
