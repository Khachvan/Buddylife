import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    "BuddyLife Armenia",
  ],
  title: "BuddyLife Armenia — Քո կենդանու կյանքը՝ կազմակերպված",
  description:
    "Վստահելի խնամք, կարևոր տեղեկություններ և կենդանիների ծառայություններ՝ մեկ հարմար վայրում։",
  alternates: { canonical: "/" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hy">
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
                  logo: "https://buddylife.am/buddylife-logo-clean.webp",
                  areaServed: { "@type": "Country", name: "Armenia" },
                  knowsAbout: [
                    "Կենդանիների խնամք",
                    "Կենդանիների կրթություն",
                    "Կենդանիների ծառայություններ Հայաստանում",
                    "Pet care in Armenia",
                  ],
                  sameAs: [
                    "https://www.instagram.com/buddylifearmenia/",
                    "https://www.facebook.com/profile.php?id=61593562114437",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://buddylife.am/#website",
                  url: "https://buddylife.am",
                  name: "BuddyLife Armenia",
                  inLanguage: ["hy", "ru", "en"],
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
