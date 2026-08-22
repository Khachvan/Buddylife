import type { Metadata } from "next";
import BuddyPage from "../site";
export const metadata: Metadata = {
  title: "Կենդանիների բիզնեսներին | BuddyLife Armenia",
  description:
    "Կառուցեք վստահություն, տեսանելիություն և կապ Հայաստանի կենդանատերերի հետ։",
};
export default function Business() {
  return <BuddyPage view="business" />;
}
