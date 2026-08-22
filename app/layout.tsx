import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buddylife-armenia.khachvantsyan.chatgpt.site"),
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
    icon: [{ url: "/buddylife-favicon.png", type: "image/png" }],
    shortcut: "/buddylife-favicon.png",
    apple: "/buddylife-favicon.png",
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
