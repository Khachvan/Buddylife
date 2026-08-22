import type { Metadata } from "next";
import BuddyPage from "../site";
export const metadata: Metadata = {
  title: "Հնարավորություններ | BuddyLife Armenia",
  description:
    "Բացահայտեք BuddyLife-ի մեկնարկային և շուտով հասանելի գործիքները կենդանատերերի ու բիզնեսների համար։",
};
export default function Features() {
  return <BuddyPage view="features" />;
}
