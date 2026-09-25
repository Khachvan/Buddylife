import DatabaseClient from "./database-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Database | BuddyLife CMS", robots: { index: false, follow: false } };

export default function DatabasePage() {
  return <DatabaseClient />;
}
