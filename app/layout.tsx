import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { resolveRobots } from "@/lib/seo";
import { getSiteChrome } from "@/lib/homepage";
import { hexToRgbTriplet } from "@/lib/color";
import "./globals.css";

export const dynamic = "force-dynamic";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const DEFAULT_OG_IMAGE = "/images/hero-museums.jpg";

// Google Analytics (GA4) — optional. Set NEXT_PUBLIC_GA_MEASUREMENT_ID in
// the environment to enable; the scripts are skipped entirely otherwise so
// we never ship a fake/placeholder tracking ID to production.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Visit Museums",
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    "Independent global travel resource for museum and attraction tickets, guided tours, and combo passes.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Visit Museums",
  url: SITE_URL,
};

export function generateMetadata(): Metadata {
  const robots = resolveRobots(false);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Visit Museums | Museum & Attraction Tickets Worldwide 2026",
      template: "%s | Visit Museums",
    },
    description:
      "Compare official museum and attraction tickets, guided tours, and combo passes worldwide. Skip the line and find other great sights nearby.",
    keywords: ["visit museums", "museum tickets", "attraction tickets", "skip the line tickets", "museum tours"],
    alternates: {
      canonical: "/",
    },
    robots,
    openGraph: {
      title: "Visit Museums | Museum & Attraction Tickets Worldwide",
      description:
        "Compare official museum and attraction tickets and guided tours worldwide, and discover other great sights nearby.",
      type: "website",
      url: SITE_URL,
      siteName: "Visit Museums",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 2400,
          height: 1350,
          alt: "Grand museum gallery hall with visitors admiring artwork",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Visit Museums | Museum & Attraction Tickets Worldwide",
      description:
        "Compare official museum and attraction tickets and guided tours worldwide, and discover other great sights nearby.",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function buildThemeStyle(theme: { primary: string; secondary: string; dark: string; accent: string }) {
  const vars: [string, string | null][] = [
    ["--color-canal-primary", hexToRgbTriplet(theme.primary)],
    ["--color-canal-blue", hexToRgbTriplet(theme.secondary)],
    ["--color-canal-ink", hexToRgbTriplet(theme.dark)],
    ["--color-sage-400", hexToRgbTriplet(theme.accent)],
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
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      {GA_MEASUREMENT_ID && (
        <head>
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        </head>
      )}
      <body className="font-body bg-[#F7F4EC] text-[#141D28] antialiased selection:bg-navy-700 selection:text-marble-50">
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
