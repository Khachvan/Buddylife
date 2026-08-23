import RegistrationsClient from "../registrations-client";

export const metadata = { title: "Pet parent registrations | BuddyLife CMS", robots: { index: false, follow: false } };

export default function ParentRegistrationsPage() {
  return <RegistrationsClient role="parent" />;
}
