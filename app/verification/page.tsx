import type { Metadata } from "next";
import BuddyPage from "../site";

export const metadata: Metadata = {
  title: "Ինչպես է աշխատելու ստուգումը | BuddyLife Armenia",
  description:
    "BuddyLife-ի բիզնես պրոֆիլների ստուգման և շարունակական վստահության մոտեցումը։",
};
export default function Verification() {
  return <BuddyPage view="verification" />;
}
