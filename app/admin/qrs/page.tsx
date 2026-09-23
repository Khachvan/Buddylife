import QrAdminClient from "./qr-admin-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tracked QR library | BuddyLife CMS",
  robots: { index: false, follow: false },
};

export default function QrAdminPage() {
  return <QrAdminClient />;
}
