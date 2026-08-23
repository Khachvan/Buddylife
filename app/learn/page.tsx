import type { Metadata } from "next";
import BuddyPage from "../site";
export const metadata: Metadata = {
  title: "Կրթական հարթակ | BuddyLife Armenia",
  description:
    "Կարճ, տեսողական և պատասխանատու նյութեր կենդանիների առողջության, անվտանգության և բարեկեցության մասին։",
  alternates: { canonical: "/learn" },
};
export default function Learn() {
  return <BuddyPage view="learn" />;
}
