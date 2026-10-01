import UsersClient from "./users-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts | BuddyLife CMS", robots: { index: false, follow: false } };

export default function UsersPage() {
  return <UsersClient />;
}
