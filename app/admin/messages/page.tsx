import MessagesClient from "./messages-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages | BuddyLife CMS", robots: { index: false, follow: false } };

export default function MessagesPage() {
  return <MessagesClient />;
}
