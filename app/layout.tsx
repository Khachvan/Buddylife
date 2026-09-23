import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { resolveLanguage } from "./language";
import MetaPixelConsent from "./meta-pixel-consent";
import ProductionAnalytics from "./production-analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buddylife.am"),
  applicationName: "BuddyLife Armenia",
  category: "pet care",
  keywords: [
    "կենդանիների խնամք",
    "կենդանիների խնամք Հայաստան",
    "կենդանիների ծառայություններ Երևան",
    "ընտանի կենդանիների հավելված",
    "կենդանու առողջության հիշեցումներ",
    "վստահելի անասնաբույժ Երևան",
    "անասնաբույժ Հայաստան",
    "շների խնամք",
    "կատուների խնամք",
    "зоотовары Армения",
    "уход за питомцами Армения",
    "pet care Armenia",
    "pet services Yerevan",
    "مراقبت از حیوانات در ارمنستان",
    "خدمات حیوانات در ایروان",
    "دامپزشک در ارمنستان",
    "BuddyLife Armenia",
  ],
  title: "BuddyLife Armenia — Քո կենդանու կյանքը՝ կազմակերպված",
  description:
    "Վստահելի խնամք, կարևոր տեղեկություններ և կենդանիների ծառայություններ՝ մեկ հարմար վայրում։",
  alternates: { canonical: "/" },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "j4vRuL8AfyNvhRVy5JLODYj18Tzkhr08aXHR7_796H4",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "BuddyLife Armenia",
    description: "Քո կենդանու կյանքը՝ կազմակերպված։",
    images: [
      { url: "/og.webp", width: 1200, height: 630, alt: "BuddyLife Armenia" },
    ],
    locale: "hy_AM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuddyLife Armenia",
    description: "Քո կենդանու կյանքը՝ կազմակերպված։",
    images: ["/og.webp"],
  },
  icons: {
    icon: [
      { url: "/buddylife-favicon-32.png", type: "image/png", sizes: "32x32" },
      {
        url: "/buddylife-favicon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    shortcut: "/buddylife-favicon-32.png",
    apple: "/buddylife-apple-touch.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = resolveLanguage((await headers()).get("x-buddylife-lang") || undefined);
  return (
    <html lang={lang} dir={lang === "fa" ? "rtl" : "ltr"}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://buddylife.am/#organization",
                  name: "BuddyLife Armenia",
                  url: "https://buddylife.am",
                  logo: "https://buddylife.am/buddylife-logo-clean.png",
                  areaServed: { "@type": "Country", name: "Armenia" },
                  knowsAbout: [
                    "Կենդանիների խնամք",
                    "Կենդանիների կրթություն",
                    "Կենդանիների ծառայություններ Հայաստանում",
                    "Уход за питомцами в Армении",
                    "Pet care in Armenia",
                    "مراقبت از حیوانات در ارمنستان",
                  ],
                  sameAs: [
                    "https://www.instagram.com/buddylifearmenia/",
                    "https://www.facebook.com/buddylifearmenia",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://buddylife.am/#website",
                  url: "https://buddylife.am",
                  name: "BuddyLife Armenia",
                  inLanguage: ["hy", "ru", "en", "fa"],
                  about: {
                    "@type": "Thing",
                    name: "Կենդանիների խնամք Հայաստանում",
                  },
                  audience: {
                    "@type": "Audience",
                    audienceType: "Pet parents and pet-care businesses in Armenia",
                    geographicArea: { "@type": "Country", name: "Armenia" },
                  },
                  publisher: { "@id": "https://buddylife.am/#organization" },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <Suspense fallback={null}>
          <MetaPixelConsent pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} initialLanguage={lang} />
        </Suspense>
        <Suspense fallback={null}>
          <ProductionAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
