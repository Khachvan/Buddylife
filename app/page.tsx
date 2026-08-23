import type { Metadata } from "next";
import BuddyPage from "./site";
export const metadata: Metadata = {
  title: "BuddyLife Armenia | Կենդանիների խնամքը՝ մեկ վայրում",
  description:
    "Կենդանու առողջությունը, խնամքը, վստահելի ծառայություններն ու համայնքը՝ մեկ հարմար հարթակում։",
  alternates: { canonical: "/" },
};
export default function Home() {
  return <BuddyPage view="home" />;
}
