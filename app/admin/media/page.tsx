import MediaClient from "./media-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media library | BuddyLife CMS", robots: { index: false, follow: false } };

export default function MediaPage() {
  return <MediaClient />;
}
