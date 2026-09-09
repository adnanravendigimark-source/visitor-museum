import type { Metadata } from "next";
import Script from "next/script";
import { Roboto, Roboto_Slab, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { resolveRobots } from "@/lib/seo";
import { getSiteChrome } from "@/lib/homepage";
import { hexToRgbTriplet } from "@/lib/color";
import "./globals.css";

export const dynamic = "force-dynamic";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-slab",
});

// Loaded specifically for the Blog section (listing page + single posts),
// which is styled to match the amsterdam-boat-tours reference site's
// typography (Outfit for headings, Plus Jakarta Sans for body copy) via the
// scoped `font-blog-display` / `font-blog-body` utilities in
// tailwind.config.ts. The rest of the site keeps its own Roboto / Roboto
// Slab pairing — these variables are additive, not a site-wide font change.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
});

const DEFAULT_OG_IMAGE = "/images/hero-louvre.jpg";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Top Museums in World - Visit Museums",
  url: SITE_URL,
  logo: `${SITE_URL}/images/visit-museums-logo.png`,
  description:
    "Visiting a museum can be a rich and rewarding experience for several reasons. Check out the most visited museums in world.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Top Museums in World - Visit Museums",
  url: SITE_URL,
};

export function generateMetadata(): Metadata {
  const robots = resolveRobots(false);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Most Visited Museums in World - Visit Museums",
      template: "%s - Visit Museums",
    },
    description:
      "Visiting a museum can be a rich and rewarding experience for several reasons. Check out the most visited museums in world.",
    keywords: ["visit museums", "museum tickets", "attraction tickets", "skip the line tickets", "museum tours", "popular museums"],
    alternates: {
      canonical: "/",
    },
    robots,
    openGraph: {
      title: "Most Visited Museums in World - Visit Museums",
      description:
        "Visiting a museum can be a rich and rewarding experience for several reasons. Check out the most visited museums in world.",
      type: "website",
      url: SITE_URL,
      siteName: "Top Museums in Europe - Visit Museums",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Visit Museums - Most Visited Museums in World",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Most Visited Museums in World - Visit Museums",
      description:
        "Visiting a museum can be a rich and rewarding experience for several reasons. Check out the most visited museums in world.",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function buildThemeStyle(theme: { primary: string; secondary: string; dark: string }) {
  const vars: [string, string | null][] = [
    ["--color-canal-primary", hexToRgbTriplet(theme.primary || "#2D903A")],
    ["--color-canal-blue", hexToRgbTriplet(theme.secondary || "#2A302F")],
    ["--color-canal-ink", hexToRgbTriplet(theme.dark || "#1F2429")],
  ];
  const declarations = vars
    .filter(([, value]) => value !== null)
    .map(([name, value]) => `${name}:${value};`)
    .join("");
  return declarations ? `:root{${declarations}}` : "";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = await getSiteChrome();
  const themeStyle = buildThemeStyle(theme);

  return (
    <html lang="en" className={`${roboto.variable} ${robotoSlab.variable} ${outfit.variable} ${plusJakartaSans.variable}`}>
      {GA_MEASUREMENT_ID && (
        <head>
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        </head>
      )}
      <body className="font-sans bg-[#FFFFFF] text-[#54595F] antialiased selection:bg-brand-green selection:text-white">
        {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
