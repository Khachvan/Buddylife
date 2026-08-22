import type { Metadata } from "next";
import BuddyPage from "../site";
export const metadata: Metadata = {
  title: "Կենդանատերերին | BuddyLife Armenia",
  description:
    "Կառավարեք ձեր կենդանու առողջությունը, հիշեցումները, փաստաթղթերն ու վստահելի ծառայությունները։",
};
export default function PetParents() {
  return <BuddyPage view="owners" />;
}
