import type { Metadata } from "next";
import BackofficeLogin from "./backoffice-login";
export const metadata: Metadata = { title: "BuddyLife Backoffice", robots: { index: false, follow: false } };
export default function BackofficePage() { return <BackofficeLogin />; }
