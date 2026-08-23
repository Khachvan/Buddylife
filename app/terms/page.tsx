import type { Metadata } from "next";
import BuddyPage from "../site";

export const metadata: Metadata = {
  title: "Օգտագործման պայմաններ | BuddyLife Armenia",
  description:
    "BuddyLife Armenia կայքի նախամեկնարկային օգտագործման պայմանները։",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  return <BuddyPage view="terms" />;
}
