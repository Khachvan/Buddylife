import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuddyLife Armenia",
    short_name: "BuddyLife",
    description: "Կենդանիների խնամքը, տեղեկությունները և վստահելի ծառայությունները՝ մեկ վայրում։",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8fc",
    theme_color: "#6f42c1",
    lang: "hy",
    icons: [
      { src: "/buddylife-favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
