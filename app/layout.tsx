import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buddylife.am"),
  title: "BuddyLife Armenia — Քո կենդանու կյանքը՝ կազմակերպված",
  description:
    "Վստահելի խնամք, կարևոր տեղեկություններ և կենդանիների ծառայություններ՝ մեկ հարմար վայրում։",
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
      <body>{children}</body>
    </html>
  );
}
