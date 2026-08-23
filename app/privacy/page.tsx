import type { Metadata } from "next";
import BuddyPage from "../site";

export const metadata: Metadata = {
  title: "Գաղտնիության քաղաքականություն | BuddyLife Armenia",
  description:
    "Ինչ տվյալներ է հավաքում BuddyLife Armenia-ն և ինչպես է դրանք օգտագործում։",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return <BuddyPage view="privacy" />;
}
