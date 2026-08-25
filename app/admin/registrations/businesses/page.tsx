import RegistrationsClient from "../registrations-client";

export const metadata = { title: "Business registrations | BuddyLife CMS", robots: { index: false, follow: false } };

export default function BusinessRegistrationsPage() {
  return <RegistrationsClient audienceRole="business" />;
}
