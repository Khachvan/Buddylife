import StatsClient from "./stats-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stats | BuddyLife CMS", robots: { index: false, follow: false } };

export default function StatsPage() {
  return <StatsClient />;
}
