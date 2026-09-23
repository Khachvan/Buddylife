import BuddyPage from "../site";
import { localizedMetadata, resolveLanguage } from "../language";
type PageProps = { searchParams: Promise<{ lang?: string | string[] }> };
export async function generateMetadata({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return localizedMetadata("verification", lang);
}
export default async function Verification({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return <BuddyPage view="verification" initialLang={lang} />;
}
